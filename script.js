// [파일 이름: script.js] - (별자리 파일명 생성 로직 최종 수정 버전)

// --- [ 0. 핵심 변수 정의 ] ---
const pageBody = document.body;
const cardContainer = document.querySelector(".card-container");
const mainPage = document.getElementById("main-page");
const resultPage = document.getElementById("result-page");
const loadingOverlay = document.getElementById("loading-overlay");
const resultContainer = document.getElementById("result-content");
const loadingText = document.getElementById("loading-text"); 

const mbtiButton = document.getElementById("mbti-button");
const astroButton = document.getElementById("astro-button"); 
const backButton = document.getElementById("back-button");
const astroRedirectButton = document.getElementById("astro-redirect-button");

const myMbtiSelect = document.getElementById("my-mbti");
const partnerMbtiSelect = document.getElementById("partner-mbti");

const tabButtons = document.querySelectorAll(".tab-button");
const tabContents = document.querySelectorAll(".tab-content");

let currentTitle = "";


// [필수] 별자리 날짜 정보 (한글 이름과 영어 이름 매핑)
const zodiacSigns = [
    { name_kr: "염소자리", name_en: "Capricorn", start: "01-01", end: "01-19" },
    { name_kr: "물병자리", name_en: "Aquarius", start: "01-20", end: "02-18" },
    { name_kr: "물고기자리", name_en: "Pisces", start: "02-19", end: "03-20" },
    { name_kr: "양자리", name_en: "Aries", start: "03-21", end: "04-19" },
    { name_kr: "황소자리", name_en: "Taurus", start: "04-20", end: "05-20" },
    { name_kr: "쌍둥이자리", name_en: "Gemini", start: "05-21", end: "06-21" },
    { name_kr: "게자리", name_en: "Cancer", start: "06-22", end: "07-22" },
    { name_kr: "사자자리", name_en: "Leo", start: "07-23", end: "08-22" },
    { name_kr: "처녀자리", name_en: "Virgo", start: "08-23", end: "09-23" },
    { name_kr: "천칭자리", name_en: "Libra", start: "09-24", end: "10-22" },
    { name_kr: "전갈자리", name_en: "Scorpio", start: "10-23", end: "11-22" },
    { name_kr: "사수자리", name_en: "Sagittarius", start: "11-23", end: "12-24" },
    { name_kr: "염소자리", name_en: "Capricorn", start: "12-25", end: "12-31" }
];

// ... (나머지 초기화 및 MBTI 로직은 동일) ...

// 3-2. 별자리 버튼 (JSON Fetch 사용)
if (astroButton) {
    astroButton.addEventListener("click", () => {
        const myDateRaw = document.getElementById("my-astro-date").value.trim();
        const partnerDateRaw = document.getElementById("partner-astro-date").value.trim();

        // MMDD (4자리 숫자) 유효성 검사
        const dateRegex = /^\d{4}$/; 
        if (!dateRegex.test(myDateRaw) || !dateRegex.test(partnerDateRaw)) {
            alert("생년월일을 '월일' 4자리 숫자(예: 0321)로 정확히 입력해주세요.");
            return;
        }

        const mySignResult = getZodiacSign('2000-' + myDateRaw);
        const partnerSignResult = getZodiacSign('2000-' + partnerDateRaw);
        
        if (mySignResult.name_kr === "미확인" || partnerSignResult.name_kr === "미확인") {
             alert("유효하지 않은 월일이거나 날짜 형식에 오류가 있습니다. 다시 확인해주세요.");
            return;
        }

        const mySign_en = mySignResult.name_en;
        const partnerSign_en = partnerSignResult.name_en;
        const mySign_kr = mySignResult.name_kr;
        const partnerSign_kr = partnerSignResult.name_kr;
        
        // [핵심 수정] 영어 별자리 이름 '알파벳 순'으로 정렬하여 파일명을 통일합니다.
        const [sign1_en, sign2_en] = [mySign_en, partnerSign_en].sort(); 

        const fileName = `${sign1_en}-${sign2_en}.json`;
        const filePath = `./data/astro/${fileName}`;

        // [수정] 한글 별자리 이름을 그대로 타이틀에 사용합니다.
        runFetch(filePath, null, `별자리 궁합: ${mySign_kr} & ${partnerSign_kr}`);
    });
}


// --- [ 4. 함수 정의 ] ---

// ... (runFetch 함수는 이전과 동일) ...

// 별자리 헬퍼: MMDD 문자열을 받아 별자리 정보 객체를 반환합니다.
function getZodiacSign(dateString) {
    const dateParts = dateString.substring(5);
    
    const month = parseInt(dateParts.substring(0, 2));
    const day = parseInt(dateParts.substring(2, 4));
    if (month < 1 || month > 12 || day < 1 || day > 31) {
        return { name_kr: "미확인", name_en: "Unknown" };
    }

    const monthDay = dateParts.substring(0, 2) + '-' + dateParts.substring(2, 4);

    for (const sign of zodiacSigns) {
        if (sign.name_kr === "염소자리" && (monthDay >= "12-25" || monthDay <= "01-19")) {
            return { name_kr: sign.name_kr, name_en: sign.name_en };
        }
        if (monthDay >= sign.start && monthDay <= sign.end) {
            return { name_kr: sign.name_kr, name_en: sign.name_en };
        }
    }
    return { name_kr: "미확인", name_en: "Unknown" }; 
}

// ... (나머지 showResult, SNS 공유 함수는 이전과 동일) ...
