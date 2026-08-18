export const translations = {
    ja: {
        selectFile: '📂 ローカルの mbr.json を選択',
        fileError: 'JSONファイルの読み込みまたはパースに失敗しました。',
        serverUpdated: 'サーバーから最新のMBRデータを取得しました。',
        gsiTile: '地理院タイル'
    },
    en: {
        selectFile: '📂 Select local mbr.json',
        fileError: 'Failed to read or parse JSON file.',
        serverUpdated: 'Updated MBR data from server.',
        gsiTile: 'GSI Maps'
    }
};
// 現在の言語（デフォルトはブラウザの言語判定、あるいは 'ja'）
let currentLang = navigator.language.startsWith('ja') ? 'ja' : 'en';
export function t(key) {
    return translations[currentLang][key] || translations['ja'][key] || key;
}
export function setLanguage(lang) {
    currentLang = lang;
    updateUI();
}
// HTML要素のうち `data-i18n="キー名"` がついた箇所のテキストを一括更新
export function updateUI() {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
        const key = el.getAttribute('data-i18n');
        if (key && translations[currentLang][key]) {
            el.textContent = translations[currentLang][key];
        }
    });
}
