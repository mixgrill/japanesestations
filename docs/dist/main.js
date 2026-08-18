import { setLanguage, updateUI } from './i18n.js';
import data from '../assets/stations.json' with { type: 'json' };
// 初期化時にUIテキストをセット
updateUI();
// 言語切替セレクトボックスのハンドリング
document.getElementById('lang-select')?.addEventListener('change', (e) => {
    const lang = e.target.value;
    setLanguage(lang);
});
// 地図の初期化 (国土地理院)
const map = L.map('map').setView([35.6812, 139.7671], 11);
L.tileLayer('https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png', {
    attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
    maxZoom: 18,
}).addTo(map);
// MBRクリアと描画を管理するための LayerGroup
const mbrLayerGroup = L.layerGroup().addTo(map);
window.onmessage = (event) => {
    try {
        const message = JSON.parse(event.data);
        if (message.type === 'UPDATE_MBR') {
            drawMBRs(message.data);
        }
    }
    catch (err) {
        console.error('WebSocketデータのパースに失敗しました:', err);
    }
};
window.onload = (event) => {
    drawMBRs(data);
};
// ② ローカルファイルの選択（ダイアログからの読み込み）
const fileInput = document.getElementById('json-file-input');
if (fileInput) {
    fileInput.addEventListener('change', (event) => {
        const target = event.target;
        const file = target.files?.[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target?.result;
                const data = JSON.parse(content);
                drawMBRs(data);
                console.log('[Client] ローカルファイルから MBR を再描画しました:', file.name);
            }
            catch (err) {
                alert('JSONファイルの読み込みまたはパースに失敗しました。');
                console.error(err);
            }
        };
        reader.readAsText(file);
        // 同じファイルを再度選択した時にも change イベントが発火するように値をリセット
        target.value = '';
    });
}
// MBRクリアと再描画関数
function drawMBRs(mbrList) {
    // ① 既存の描画済み図形を全てクリア
    mbrLayerGroup.clearLayers();
    if (!Array.isArray(mbrList) || mbrList.length === 0)
        return;
    const bounds = [];
    mbrList.forEach((mbr) => {
        // [minY, minX] (南西) と [maxY, maxX] (北東)
        const southWest = [mbr.minY, mbr.minX];
        const northEast = [mbr.maxY, mbr.maxX];
        const rectangle = L.rectangle([southWest, northEast], {
            color: mbr.color || '#3388ff',
            weight: mbr.width ?? 2,
            fillOpacity: 0.2
        });
        rectangle.addTo(mbrLayerGroup);
        bounds.push(rectangle.getBounds());
    });
    // ② 全てのMBRが画面内に収まるよう自動ズーム調整
    if (bounds.length > 0) {
        const combinedBounds = bounds.reduce((acc, cur) => acc.extend(cur));
        map.fitBounds(combinedBounds, { padding: [20, 20] });
    }
}
