// [파일 이름: script.js] - (영어 파일명 & MMDD 포맷 로직 통합 버전)

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

let currentResultHTML = ""; 
let currentTitle = "";


// --- [ 1. 데이터 및 초기화 ] ---

// [필수] 별자리 날짜 정보 (한글 이름과 MM-DD 경계)
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

// MBTI 셀렉트 박스 채우기 (생략 - 이전과 동일)
const mbtiTypes = ["INFP", "INFJ", "INTP", "INTJ", "ISFP", "ISFJ", "ISTP", "ISTJ", 
                   "ENFP", "ENFJ", "ENTP", "ENTJ", "ESFP", "ESFJ", "ESTP", "ESTJ"];
mbtiTypes.forEach(type => {
    if (myMbtiSelect) {
        myMbtiSelect.innerHTML += `<option value="${type}">${type}</option>`;
    }
    if (partnerMbtiSelect) {
        partnerMbtiSelect.innerHTML += `<option value="${type}">${type}</option>`;
    }
});


// --- [ 2. 이벤트 리스너 연결 ] ---

// 탭 메뉴 기능 (생략 - 이전과 동일)
tabButtons.forEach(button => {
    button.addEventListener("click", () => {
        const tabId = button.dataset.tab;
        
        tabButtons.forEach(btn => btn.classList.remove("active"));
        tabContents.forEach(content => content.classList.remove("active"));
        
        button.classList.add("active");
        document.getElementById(tabId).classList.add("active");
    });
});

// MBTI 버튼 (생략 - 이전과 동일)
if (mbtiButton) {
    mbtiButton.addEventListener("click", () => {
        const myMbti = myMbtiSelect.value;
        const partnerMbti = partnerMbtiSelect.value;
        
        const [type1, type2] = [myMbti, partnerMbti].sort();
        const fileName = `${type1}-${type2}.json`;
        const filePath = `./data/mbti/${fileName}`;
        const reverseFilePath = `./data/mbti/${partnerMbti}-${myMbti}.json`;

        runFetch(filePath, reverseFilePath, `MBTI 궁합: ${myMbti} & ${partnerMbti}`);
    });
}

// ⭐ 별자리 버튼 (MMDD 입력 & 영어 파일명 Fetch 사용)
if (astroButton) {
    astroButton.addEventListener("click", () => {
        const myDateRaw = document.getElementById("my-astro-date").value.trim();
        const partnerDateRaw = document.getElementById("partner-astro-date").value.trim();

        // [핵심] MMDD (4자리 숫자) 유효성 검사
        const dateRegex = /^\d{4}$/; 
        if (!dateRegex.test(myDateRaw) || !dateRegex.test(partnerDateRaw)) {
            alert("생년월일을 '월일' 4자리 숫자(예: 0321)로 정확히 입력해주세요.");
            return;
        }

        const mySignResult = getZodiacSign(myDateRaw);
        const partnerSignResult = getZodiacSign(partnerDateRaw);
        
        if (mySignResult.name_kr === "미확인" || partnerSignResult.name_kr === "미확인") {
             alert("유효하지 않은 월일이거나 날짜 형식에 오류가 있습니다. 다시 확인해주세요.");
            return;
        }

        const mySign_en = mySignResult.name_en;
        const partnerSign_en = partnerSignResult.name_en;
        const mySign_kr = mySignResult.name_kr;
        const partnerSign_kr = partnerSignResult.name_kr;
        
        // [핵심] 영어 별자리 이름 알파벳 순으로 정렬하여 파일명을 통일합니다.
        const [sign1_en, sign2_en] = [mySign_en, partnerSign_en].sort(); 

        const fileName = `${sign1_en}-${sign2_en}.json`;
        const filePath = `./data/astro/${fileName}`;

        runFetch(filePath, null, `별자리 궁합: ${mySign_kr} & ${partnerSign_kr}`);
    });
}


// 상세 페이지 버튼 기능 (생략 - 이전과 동일)
if (backButton) {
    backButton.addEventListener("click", () => {
        resultPage.classList.add("hidden");
        mainPage.classList.remove("hidden");
        cardContainer.classList.remove("result-active");
        pageBody.classList.remove("result-active");
        window.scrollTo(0, 0);
    });
}
// ... (astroRedirectButton 로직은 이전과 동일) ...


// --- [ 3. 함수 정의 ] ---

// MBTI/별자리 공통: Fetch 및 페이지 컨트롤 (생략 - 이전과 동일)
function runFetch(filePath, reverseFilePath, title) {
    loadingOverlay.classList.remove("hidden");
    loadingText.textContent = "궁합 데이터를 불러오는 중입니다...";
    
    fetch(filePath)
        // ... (오류 및 성공 로직) ...
        .finally(() => {
            loadingOverlay.classList.add("hidden");
            window.scrollTo(0, 0); 
        });
}

// ⭐ 별자리 헬퍼: MMDD 문자열을 받아 별자리 정보 객체를 반환합니다.
function getZodiacSign(mmddString) {
    const month = parseInt(mmddString.substring(0, 2));
    const day = parseInt(mmddString.substring(2, 4));
    
    // 유효하지 않은 월일 기본 검사
    if (month < 1 || month > 12 || day < 1 || day > 31) {
        return { name_kr: "미확인", name_en: "Unknown" };
    }
    
    const monthDay = mmddString.substring(0, 2) + '-' + mmddString.substring(2, 4); // MM-DD 형식으로 변환

    for (const sign of zodiacSigns) {
        // 염소자리(12월 말 ~ 1월 초) 처리
        if (sign.name_kr === "염소자리" && (monthDay >= "12-25" || monthDay <= "01-19")) {
            return { name_kr: "염소자리", name_en: "Capricorn" };
        }
        // 일반 별자리 처리
        if (monthDay >= sign.start && monthDay <= sign.end) {
            return { name_kr: sign.name_kr, name_en: sign.name_en };
        }
    }
    return { name_kr: "미확인", name_en: "Unknown" }; // 안전장치
}

// 공통: 상세 페이지 기능 - 결과 표시 (생략 - 이전과 동일)
function showResult(result, title) {
    // ... (이전 showResult 함수 내용 전체) ...
}

// SNS 공유 기능 로직 (생략 - 이전과 동일)
// ... (setupResultShareButtons, shareResultLink 함수 내용 전체) ...
