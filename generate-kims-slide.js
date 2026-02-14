const pptxgen = require("pptxgenjs");

// ============================================================
// 재료연 보유기술 현황과 사업화 과제 - 슬라이드 재현
// ============================================================

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9"; // 10" x 5.625"
pres.author = "KIMS";
pres.title = "재료연 보유기술 현황과 사업화 과제";

// ── Design Tokens ──────────────────────────────────────────
const C = {
  navy:       "1B2A4A",
  darkNavy:   "0F1B33",
  gold:       "C5A55A",
  white:      "FFFFFF",
  lightGray:  "F5F5F5",
  gray:       "999999",
  darkText:   "333333",
  midText:    "555555",
  accent1:    "3A7BD5",  // blue
  accent2:    "E8734A",  // orange
  accent3:    "5CB85C",  // green
  accent4:    "F0C040",  // yellow
  accent5:    "9B59B6",  // purple
  accent6:    "1ABC9C",  // teal
  barBlue:    "4A8BC2",
  barHighlight: "D4A843",
  red:        "E74C3C",
};

const FONT = {
  heading: "맑은 고딕",
  body: "맑은 고딕",
};

const slide = pres.addSlide();
slide.background = { color: C.white };

// ============================================================
// 1. TITLE BAR (상단 네이비 배경)
// ============================================================
// 네이비 배경 바
slide.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 10, h: 0.85,
  fill: { color: C.navy },
});

// 좌측 골드 악센트 라인
slide.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 0, w: 0.06, h: 0.85,
  fill: { color: C.gold },
});

// 메인 제목
slide.addText("재료연 보유기술 현황과 사업화 과제", {
  x: 0.4, y: 0.05, w: 7, h: 0.5,
  fontSize: 22, fontFace: FONT.heading, bold: true,
  color: C.white, align: "left", valign: "middle", margin: 0,
});

// 부제목
slide.addText("2015~2024 특허출원 및 기술이전 실적 분석", {
  x: 0.4, y: 0.48, w: 7, h: 0.32,
  fontSize: 11, fontFace: FONT.body,
  color: C.gold, align: "left", valign: "top", margin: 0,
});

// 우측 로고 텍스트 (KIMS)
slide.addText("KIMS", {
  x: 8.5, y: 0.15, w: 1.3, h: 0.55,
  fontSize: 18, fontFace: "Arial", bold: true,
  color: C.gold, align: "center", valign: "middle", margin: 0,
});

// ============================================================
// 2. 좌상단 - 꺾은선 차트: 연도별 특허출원 동향
// ============================================================
// 섹션 제목
slide.addText("연도별 특허출원 동향", {
  x: 0.35, y: 0.95, w: 4.0, h: 0.35,
  fontSize: 12, fontFace: FONT.heading, bold: true,
  color: C.navy, align: "left", valign: "middle", margin: 0,
});

// 총 건수 뱃지
slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
  x: 3.2, y: 0.97, w: 1.1, h: 0.28,
  fill: { color: C.navy },
  rectRadius: 0.05,
});
slide.addText("총 566건", {
  x: 3.2, y: 0.97, w: 1.1, h: 0.28,
  fontSize: 9, fontFace: FONT.body, bold: true,
  color: C.white, align: "center", valign: "middle", margin: 0,
});

// 꺾은선 차트
const patentYears = ["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024"];
const patentValues = [45, 52, 68, 72, 65, 60, 58, 55, 48, 43];

slide.addChart(pres.charts.LINE, [{
  name: "특허출원",
  labels: patentYears,
  values: patentValues,
}], {
  x: 0.3, y: 1.3, w: 4.4, h: 2.15,
  showTitle: false,
  lineSize: 2.5,
  lineSmooth: false,
  chartColors: [C.accent1],
  showMarker: true,
  markerSize: 6,
  showValue: true,
  dataLabelPosition: "t",
  dataLabelColor: C.darkText,
  dataLabelFontSize: 7,
  catAxisLabelColor: C.midText,
  catAxisLabelFontSize: 8,
  valAxisLabelColor: C.midText,
  valAxisLabelFontSize: 8,
  valGridLine: { color: "E8E8E8", size: 0.5 },
  catGridLine: { style: "none" },
  showLegend: false,
  plotArea: { fill: { color: "FAFAFA" } },
});

// 주석: 감소 추세 콜아웃
slide.addShape(pres.shapes.RECTANGLE, {
  x: 3.1, y: 1.35, w: 1.55, h: 0.35,
  fill: { color: "FFF3E0" },
  line: { color: C.accent2, width: 1 },
  rectRadius: 0.03,
});
slide.addText("최근 2~3년 감소 추세", {
  x: 3.1, y: 1.35, w: 1.55, h: 0.35,
  fontSize: 8, fontFace: FONT.body, bold: true,
  color: C.accent2, align: "center", valign: "middle", margin: 0,
});

// 아래 화살표 (선으로 표현)
slide.addShape(pres.shapes.LINE, {
  x: 3.88, y: 1.7, w: 0, h: 0.25,
  line: { color: C.accent2, width: 1.5, dashType: "solid" },
});

// ============================================================
// 3. 우상단 - 도넛 차트: IPC 기술분야별 특허분포
// ============================================================
// 섹션 제목
slide.addText("IPC 기술분야별 특허분포 (566건)", {
  x: 5.1, y: 0.95, w: 4.5, h: 0.35,
  fontSize: 12, fontFace: FONT.heading, bold: true,
  color: C.navy, align: "left", valign: "middle", margin: 0,
});

// 도넛 차트
slide.addChart(pres.charts.DOUGHNUT, [{
  name: "IPC 분포",
  labels: ["C22C", "H01F", "C22F", "G01N", "C23C", "B22F", "기타"],
  values: [124, 55, 54, 54, 40, 35, 204],
}], {
  x: 5.2, y: 1.25, w: 2.4, h: 2.2,
  showTitle: false,
  chartColors: [C.accent1, C.accent2, C.accent3, C.accent4, C.accent5, C.accent6, C.gray],
  showPercent: false,
  showValue: false,
  showLegend: false,
  dataLabelColor: C.white,
  dataLabelFontSize: 8,
});

// 도넛 차트 범례 (수동, 우측에 배치)
const legendItems = [
  { label: "C22C (124건)", color: C.accent1 },
  { label: "H01F (55건)", color: C.accent2 },
  { label: "C22F (54건)", color: C.accent3 },
  { label: "G01N (54건)", color: C.accent4 },
  { label: "C23C (40건)", color: C.accent5 },
  { label: "B22F (35건)", color: C.accent6 },
  { label: "기타 (204건)", color: C.gray },
];

legendItems.forEach((item, i) => {
  const ly = 1.35 + i * 0.27;
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 7.85, y: ly, w: 0.18, h: 0.18,
    fill: { color: item.color },
  });
  slide.addText(item.label, {
    x: 8.1, y: ly - 0.02, w: 1.7, h: 0.22,
    fontSize: 8, fontFace: FONT.body,
    color: C.darkText, align: "left", valign: "middle", margin: 0,
  });
});

// ============================================================
// 4. 구분선
// ============================================================
slide.addShape(pres.shapes.LINE, {
  x: 0.35, y: 3.55, w: 9.3, h: 0,
  line: { color: "DDDDDD", width: 0.75, dashType: "dash" },
});

// ============================================================
// 5. 하단 - 막대 차트: 연도별 기술이전 건수 및 기술료
// ============================================================
// 섹션 제목
slide.addText("연도별 기술이전 건수 및 기술료", {
  x: 0.35, y: 3.62, w: 5, h: 0.35,
  fontSize: 12, fontFace: FONT.heading, bold: true,
  color: C.navy, align: "left", valign: "middle", margin: 0,
});

// 범례 (수동)
// 기술이전 건수
slide.addShape(pres.shapes.RECTANGLE, {
  x: 5.5, y: 3.7, w: 0.25, h: 0.15,
  fill: { color: C.barBlue },
});
slide.addText("기술이전 건수", {
  x: 5.8, y: 3.65, w: 1.2, h: 0.25,
  fontSize: 8, fontFace: FONT.body, color: C.midText,
  align: "left", valign: "middle", margin: 0,
});

// 기술료
slide.addShape(pres.shapes.RECTANGLE, {
  x: 7.1, y: 3.7, w: 0.25, h: 0.15,
  fill: { color: C.barHighlight },
});
slide.addText("기술료(백만원)", {
  x: 7.4, y: 3.65, w: 1.2, h: 0.25,
  fontSize: 8, fontFace: FONT.body, color: C.midText,
  align: "left", valign: "middle", margin: 0,
});

// 막대 차트 (기술이전 건수 + 기술료)
const transferYears = ["2015", "2016", "2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024"];
const transferCount = [58, 125, 78, 85, 95, 80, 88, 75, 82, 70];
const transferRevenue = [320, 980, 450, 520, 680, 510, 620, 480, 550, 420];

slide.addChart(pres.charts.BAR, [
  { name: "기술이전 건수", labels: transferYears, values: transferCount },
  { name: "기술료(백만원)", labels: transferYears, values: transferRevenue },
], {
  x: 0.3, y: 3.95, w: 9.3, h: 1.55,
  showTitle: false,
  barDir: "col",
  barGrouping: "clustered",
  chartColors: [C.barBlue, C.barHighlight],
  catAxisLabelColor: C.midText,
  catAxisLabelFontSize: 8,
  valAxisLabelColor: C.midText,
  valAxisLabelFontSize: 7,
  valGridLine: { color: "E8E8E8", size: 0.5 },
  catGridLine: { style: "none" },
  showValue: false,
  showLegend: false,
  valAxisHidden: false,
  catAxisOrientation: "minMax",
});

// 주석: 2016년 하이라이트 콜아웃
slide.addShape(pres.shapes.RECTANGLE, {
  x: 1.3, y: 3.95, w: 1.5, h: 0.28,
  fill: { color: "FFF8E1" },
  line: { color: C.barHighlight, width: 1 },
  rectRadius: 0.03,
});
slide.addText("2016년 최고 실적", {
  x: 1.3, y: 3.95, w: 1.5, h: 0.28,
  fontSize: 8, fontFace: FONT.body, bold: true,
  color: C.barHighlight, align: "center", valign: "middle", margin: 0,
});

// ============================================================
// 6. 하단 푸터
// ============================================================
slide.addShape(pres.shapes.RECTANGLE, {
  x: 0, y: 5.35, w: 10, h: 0.28,
  fill: { color: C.navy },
});
slide.addText("한국재료연구원(KIMS) | 기술사업화 전략 보고서 | 2024", {
  x: 0.4, y: 5.35, w: 9.2, h: 0.28,
  fontSize: 8, fontFace: FONT.body,
  color: C.gold, align: "center", valign: "middle", margin: 0,
});

// ============================================================
// SAVE
// ============================================================
pres.writeFile({ fileName: "/home/user/skills/output-kims.pptx" })
  .then(() => console.log("✓ Created output-kims.pptx"))
  .catch(err => console.error("Error:", err));
