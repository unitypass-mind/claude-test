# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 프로젝트 개요

한글로 명언을 표시하는 간단한 정적 웹 애플리케이션입니다. 전체 애플리케이션은 CSS와 JavaScript가 포함된 단일 HTML 파일로 구성되어 있습니다.

## 아키텍처

**단일 파일 구조**: 프로젝트는 다음을 포함하는 하나의 `index.html` 파일을 사용합니다:
- 시맨틱 요소로 구성된 HTML 구조
- 모든 CSS가 포함된 `<style>` 태그
- 모든 JavaScript 로직이 포함된 `<script>` 태그

**주요 구성 요소**:
- 명언 데이터는 JavaScript 배열 객체에 저장됨 (174-255번 줄), 각 객체는 `text`와 `author` 속성을 포함
- 상태 관리는 현재 명언을 추적하는 간단한 `currentIndex` 변수 사용
- DOM 조작 함수: `displayQuote()`, `getRandomQuote()`, `nextQuote()`

## 개발

**애플리케이션 실행**: 최신 웹 브라우저에서 `index.html` 파일을 직접 열면 됩니다. 빌드 프로세스, 의존성, 로컬 서버가 필요하지 않습니다.

**테스트**: 브라우저에서 수동 테스트만 가능합니다. 테스트 프레임워크는 구성되어 있지 않습니다.

## 코드 스타일

- UI 텍스트와 많은 명언 내용에 한국어 사용
- CSS는 최신 기능 사용: flexbox, gradients, animations, media queries
- JavaScript는 vanilla ES6+ 문법 사용 (const, arrow functions, template literals)
- 애니메이션 패턴: CSS keyframe 애니메이션을 JavaScript에서 `animation = 'none'`으로 설정한 후 다시 적용하여 리셋

## 주요 구현 세부사항

**명언 표시 로직**: 명언 전환 시, `style.animation = 'none'`으로 애니메이션을 리셋한 후, 10ms setTimeout 이후 DOM 콘텐츠를 업데이트하고 애니메이션을 다시 적용하여 부드러운 전환 효과 구현.

**반응형 디자인**: 600px에서 모바일 브레이크포인트 적용, 폰트 크기와 패딩 축소.

**색상 테마**: 보라색 그라데이션 테마 (#667eea에서 #764ba2)를 버튼과 강조 요소에 전체적으로 사용.
