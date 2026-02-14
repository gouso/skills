/**
 * pptx-automizer 방식 KIMS 슬라이드 생성
 *
 * 핵심 원리: PowerPoint에서 디자인한 템플릿(output-kims-openxml.pptx)을
 * 그대로 가져와서 텍스트·차트 데이터만 코드로 교체.
 * → 디자인 재현도 100%, 코드는 데이터 주입만 담당.
 *
 * 워크플로우:
 *   1. 템플릿 PPTX 로드 (디자이너가 만든 원본)
 *   2. 슬라이드 import
 *   3. 텍스트/차트 데이터 교체
 *   4. 새 PPTX 출력
 */

const Automizer = require("pptx-automizer").default;
const modify = require("pptx-automizer").modify;

async function main() {
  // ── 1. Automizer 초기화 ─────────────────────────────────
  const automizer = new Automizer({
    templateDir: __dirname,            // 템플릿 디렉토리 (현재 폴더)
    outputDir: __dirname,              // 출력 디렉토리
    removeExistingSlides: true,        // root 템플릿의 기존 슬라이드 제거
    autoImportSlideMasters: true,      // 슬라이드 마스터 자동 임포트
    cleanup: false,
  });

  // ── 2. 템플릿 로드 ──────────────────────────────────────
  // 빈 root + 디자인 템플릿을 분리해야 슬라이드 중복 방지
  const pres = automizer
    .loadRoot("template-blank.pptx")
    .load("output-kims-openxml.pptx", "kims");

  // ── 3. 슬라이드 1 임포트 + 수정 ────────────────────────
  pres.addSlide("kims", 1, (slide) => {

    // ── 3a. 텍스트 수정 ────────────────────────────────
    // 메인 제목 교체
    slide.modifyElement("TextBox 3", [
      modify.setText("재료연 보유기술 현황과 사업화 과제"),
    ]);

    // 부제목 교체
    slide.modifyElement("TextBox 4", [
      modify.setText("2015~2024 특허출원 및 기술이전 실적 분석"),
    ]);

    // 총 건수 배지
    slide.modifyElement("TextBox 8", [
      modify.setText("총 566건"),
    ]);

    // 콜아웃: 감소 추세
    slide.modifyElement("TextBox 11", [
      modify.setText("최근 2~3년 감소 추세 ↓"),
    ]);

    // IPC 섹션 제목
    slide.modifyElement("TextBox 12", [
      modify.setText("IPC 기술분야별 특허분포 (566건)"),
    ]);

    // 하단 콜아웃: 2016년 최고 실적
    slide.modifyElement("TextBox 36", [
      modify.setText("2016년 최고 실적 ★"),
    ]);

    // 푸터
    slide.modifyElement("TextBox 38", [
      modify.setText("한국재료연구원(KIMS)  |  기술사업화 전략 보고서  |  2024"),
    ]);

    // ── 3b. 차트 데이터 교체 ──────────────────────────
    // Chart 9 = 꺾은선 차트 (연도별 특허출원 동향)
    slide.modifyElement("Chart 9", [
      modify.setChartData({
        series: [
          { label: "특허출원" },
        ],
        categories: [
          { label: "2015", values: [45] },
          { label: "2016", values: [52] },
          { label: "2017", values: [68] },
          { label: "2018", values: [72] },
          { label: "2019", values: [65] },
          { label: "2020", values: [60] },
          { label: "2021", values: [58] },
          { label: "2022", values: [55] },
          { label: "2023", values: [48] },
          { label: "2024", values: [43] },
        ],
      }),
    ]);

    // Chart 13 = 도넛 차트 (IPC 기술분야별 특허분포)
    slide.modifyElement("Chart 13", [
      modify.setChartData({
        series: [
          { label: "건수" },
        ],
        categories: [
          { label: "C22C", values: [124] },
          { label: "H01F", values: [55] },
          { label: "C22F", values: [54] },
          { label: "G01N", values: [54] },
          { label: "C23C", values: [40] },
          { label: "B22F", values: [35] },
          { label: "기타",  values: [204] },
        ],
      }),
    ]);

    // Chart 34 = 막대 차트 (연도별 기술이전 건수 및 기술료)
    slide.modifyElement("Chart 34", [
      modify.setChartData({
        series: [
          { label: "기술이전 건수" },
          { label: "기술료(백만원)" },
        ],
        categories: [
          { label: "2015", values: [58, 320] },
          { label: "2016", values: [125, 980] },
          { label: "2017", values: [78, 450] },
          { label: "2018", values: [85, 520] },
          { label: "2019", values: [95, 680] },
          { label: "2020", values: [80, 510] },
          { label: "2021", values: [88, 620] },
          { label: "2022", values: [75, 480] },
          { label: "2023", values: [82, 550] },
          { label: "2024", values: [70, 420] },
        ],
      }),
    ]);
  });

  // ── 4. 출력 ─────────────────────────────────────────────
  const result = await pres.write("output-kims-automizer.pptx");
  console.log("✓ Created output-kims-automizer.pptx");
  console.log(result);

  // ── 5. 데이터만 바꿔서 2025 버전도 생성 (템플릿 재사용 데모) ──
  const pres2025 = automizer
    .loadRoot("template-blank.pptx")
    .load("output-kims-openxml.pptx", "kims2025");

  pres2025.addSlide("kims2025", 1, (slide) => {
    // 텍스트만 2025 버전으로 교체 → 디자인은 완전 동일
    slide.modifyElement("TextBox 3", [
      modify.setText("재료연 보유기술 현황과 사업화 과제"),
    ]);
    slide.modifyElement("TextBox 4", [
      modify.setText("2015~2025 특허출원 및 기술이전 실적 분석"),
    ]);
    slide.modifyElement("TextBox 8", [
      modify.setText("총 612건"),
    ]);
    slide.modifyElement("TextBox 12", [
      modify.setText("IPC 기술분야별 특허분포 (612건)"),
    ]);
    slide.modifyElement("TextBox 11", [
      modify.setText("2025년 반등 추세 ↑"),
    ]);
    slide.modifyElement("TextBox 38", [
      modify.setText("한국재료연구원(KIMS)  |  기술사업화 전략 보고서  |  2025"),
    ]);

    // 2025년 데이터가 추가된 차트
    slide.modifyElement("Chart 9", [
      modify.setChartData({
        series: [{ label: "특허출원" }],
        categories: [
          { label: "2015", values: [45] },
          { label: "2016", values: [52] },
          { label: "2017", values: [68] },
          { label: "2018", values: [72] },
          { label: "2019", values: [65] },
          { label: "2020", values: [60] },
          { label: "2021", values: [58] },
          { label: "2022", values: [55] },
          { label: "2023", values: [48] },
          { label: "2024", values: [43] },
          { label: "2025", values: [46] },  // 신규 데이터
        ],
      }),
    ]);

    slide.modifyElement("Chart 13", [
      modify.setChartData({
        series: [{ label: "건수" }],
        categories: [
          { label: "C22C", values: [138] },
          { label: "H01F", values: [61] },
          { label: "C22F", values: [58] },
          { label: "G01N", values: [57] },
          { label: "C23C", values: [44] },
          { label: "B22F", values: [38] },
          { label: "기타",  values: [216] },
        ],
      }),
    ]);

    slide.modifyElement("Chart 34", [
      modify.setChartData({
        series: [
          { label: "기술이전 건수" },
          { label: "기술료(백만원)" },
        ],
        categories: [
          { label: "2015", values: [58, 320] },
          { label: "2016", values: [125, 980] },
          { label: "2017", values: [78, 450] },
          { label: "2018", values: [85, 520] },
          { label: "2019", values: [95, 680] },
          { label: "2020", values: [80, 510] },
          { label: "2021", values: [88, 620] },
          { label: "2022", values: [75, 480] },
          { label: "2023", values: [82, 550] },
          { label: "2024", values: [70, 420] },
          { label: "2025", values: [76, 460] },  // 신규 데이터
        ],
      }),
    ]);
  });

  const result2 = await pres2025.write("output-kims-automizer-2025.pptx");
  console.log("\n✓ Created output-kims-automizer-2025.pptx (2025 version)");
  console.log(result2);
}

main().catch(console.error);
