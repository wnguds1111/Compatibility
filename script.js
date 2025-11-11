// [파일 이름: script.js] - (월/일만 입력 로직 통합 버전)

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

// [필수] 별자리 날짜 정보 (로직 사용을 위해 내장)
const zodiacSigns = [
    { name: "염소자리", start: "01-01", end: "01-19" },
    { name: "물병자리", start: "01-20", end: "02-18" },
    { name: "물고기자리", start: "02-19", end: "03-20" },
    { name: "양자리", start: "03-21", end: "04-19" },
    { name: "황소자리", start: "04-20", end: "05-20" },
    { name: "쌍둥이자리", start: "05-21", end: "06-21" },
    { name: "게자리", start: "06-22", end: "07-22" },
    { name: "사자자리", start: "07-23", end: "08-22" },
    { name: "처녀자리", start: "08-23", end: "09-23" },
    { name: "천칭자리", start: "09-24", end: "10-22" },
    { name: "전갈자리", start: "10-23", end: "11-22" },
    { name: "사수자리", start: "11-23", end: "12-24" },
    { name: "염소자리", start: "12-25", end: "12-31" }
];

// ... (나머지 초기화 및 MBTI 로직은 동일) ...

// --- [ 3. 이벤트 리스너 연결 ] ---

// ... (MBTI 버튼 로직은 동일) ...

// 3-2. 별자리 버튼 (JSON Fetch 사용)
if (astroButton) {
    astroButton.addEventListener("click", () => {
        const myDateRaw = document.getElementById("my-astro-date").value.trim();
        const partnerDateRaw = document.getElementById("partner-astro-date").value.trim();

        // [핵심] 월/일 형식(MM-DD) 유효성 검사
        const dateRegex = /^\d{2}-\d{2}$/; // 00-00 형식
        if (!dateRegex.test(myDateRaw) || !dateRegex.test(partnerDateRaw)) {
            alert("생년월일을 '월-일' 형식(예: 03-21)으로 정확히 입력해주세요.");
            return;
        }

        const mySign = getZodiacSign('2000-' + myDateRaw); // 연도 2000년으로 임시 설정
        const partnerSign = getZodiacSign('2000-' + partnerDateRaw);
        
        if (mySign === "미확인" || partnerSign === "미확인") {
             alert("유효하지 않은 월일입니다. 다시 확인해주세요.");
            return;
        }

        // 별자리 이름 한글 이름 순으로 정렬하여 파일명을 통일합니다.
        const [sign1, sign2] = [mySign, partnerSign].sort((a, b) => a.localeCompare(b, 'ko'));

        const fileName = `${sign1}-${sign2}.json`;
        const filePath = `./data/astro/${fileName}`;

        runFetch(filePath, null, `별자리 궁합: ${mySign} & ${partnerSign}`);
    });
}


// --- [ 4. 함수 정의 ] ---

// MBTI 전용: Fetch 및 페이지 컨트롤 (이전과 동일)
function runFetch(filePath, reverseFilePath, title) {
    loadingOverlay.classList.remove("hidden");
    loadingText.textContent = "궁합 데이터를 불러오는 중입니다...";
    
    // ... (Fetch 로직은 이전과 동일하게 유지됩니다) ...
    // ... (404 처리, JSON 파싱 로직도 이전과 동일하게 유지됩니다) ...
    
    fetch(filePath)
        // ... (오류 및 성공 로직) ...
        .finally(() => {
            loadingOverlay.classList.add("hidden");
            window.scrollTo(0, 0); 
        });
}

// 별자리 헬퍼: 생년월일(YYYY-MM-DD)을 별자리 이름으로 바꿔주는 함수
function getZodiacSign(dateString) {
    // [수정] 입력된 문자열에서 '월-일' 부분만 사용합니다.
    const dateParts = dateString.substring(5); // 'YYYY-MM-DD'에서 'MM-DD' 추출
    
    // 유효하지 않은 날짜인 경우 '미확인' 반환
    const month = parseInt(dateParts.substring(0, 2));
    const day = parseInt(dateParts.substring(3, 5));
    if (month < 1 || month > 12 || day < 1 || day > 31) {
        return "미확인";
    }

    // zodiacSigns 배열을 순회하며 별자리 이름 반환 (이전과 동일)
    for (const sign of zodiacSigns) {
        if (sign.name === "염소자리" && (dateParts >= "12-25" || dateParts <= "01-19")) {
            return "염소자리";
        }
        if (dateParts >= sign.start && dateParts <= sign.end) {
            return sign.name;
        }
    }
    return "미확인"; // 안전장치
}

// ... (나머지 showResult, SNS 공유 함수는 이전과 동일) ...
