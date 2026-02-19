# SmartChain — AI 기반 협력사 리스크 관리 플랫폼

> KT AIVLE School 8기 빅프로젝트 | 수도권 5반 10조

**HD현대중공업**의 협력사 ESG·안전보건·컴플라이언스 증빙서류를 AI로 자동 검증하고, 역할별 업무 흐름을 통합 관리하는 플랫폼입니다.

---

## 과제 선정 배경

| 규제 | 내용 |
|------|------|
| **중대재해처벌법 전면 확대** | 2024.01.27부터 상시근로자 5인 이상 전 사업장 적용, 위험성 평가 인정 기준 70점 → 90점 상향 |
| **하도급법 개정** | 2025.03 하도급법 개정안 국회 통과, 공정거래위원회 방산 업계 집중 단속 |
| **EU CSDDD 법제화** | 공급망 인권·환경 리스크 실사 의무 제도화 — 증빙 기반 투명한 실사 체계 구축 필수 |

기존 체크리스트 방식으로는 약 3,354개 협력사를 관리하는 데 한계가 있습니다. SmartChain은 **파일 업로드만으로 AI가 자동 분류·검증**하여 검증 리드타임을 최대 **90% 단축**합니다.

---

## 기대 효과

| KPI | As-Is | To-Be |
|-----|-------|-------|
| 1개사 검증 리드타임 | 0.5 ~ 2일 | **10 ~ 30분** 이내 1차 판정 |
| 재제출(보완) 왕복 횟수 | 2 ~ 4회 | **1 ~ 2회** |
| 형식 오류 자동 검출률 | 사람 의존 | **95%+** 목표 |
| 담당자 검토 대상 비율 | 전체 파일 | **20 ~ 40%** (이슈 슬롯만) |

---

## 사용자 역할 및 주요 기능

### 게스트
- 회사명 / 요청 역할 입력 후 권한 신청
- 승인·반려 처리 상태 확인

### 기안자 (협력사 작성 직원)
- PDF / XLSX / 이미지 업로드 후 도메인별 필수 제출 항목 체크리스트(Preview) 확인
- 파일명·형식·헤더·키워드 기반 자동 분류로 제출 항목 추천 및 누락 탐지
- 제출 시 PDF 파서·Pandas·OCR 자동 적용으로 형식 오류 / 기간 불일치 / 판독 불가 사전 확인

### 결재자 (협력사 팀장)
- 체크리스트와 검증 결과 요약을 보고 승인 또는 반려 결정
- 제출 전 단계에서 누락·오류를 조기 차단해 외부 반려 리스크 최소화

### 수신자 (원청 HD현대)
- 도메인별 제출 충족 여부와 핵심 이슈를 요약 형태로 빠르게 확인
- LLM 기반 보완 요청 문장 자동 생성으로 커뮤니케이션 비용 절감
- 외부 뉴스 기반 협력사 ESG 리스크 점수 실시간 모니터링

---

## 관리 도메인

| 도메인 | 주요 증빙 문서 |
|--------|---------------|
| **컴플라이언스** | 근로계약서, 교육출석부/교육일 사진, 컴플라이언스 교육, 부정부패 관련 문서, 개인정보교육 이수현황(Excel), 공정거래 점검표(Excel) |
| **안전보건** | 안전보건관리체계 구축 매뉴얼, 소방시설 자체점검 결과표, 현장 사진, 교육출석부, 안전교육 이수현황(Excel), 위험성 평가서(Excel) |
| **ESG** | ISO 45001, 이사회 관련 사항, 윤리강령, 도시가스·수도·전기 요금 고지서, 유해물질 목록(Excel), 에너지 사용량(Excel) |

---

## 기술 스택

### Frontend (본 레포지토리)

| 분류 | 기술 |
|------|------|
| UI | React 18.3, TypeScript 5.3, Tailwind CSS v4, Radix UI |
| 빌드 | Vite 5 |
| 라우팅 | React Router v6 |
| 서버 상태 | TanStack Query v5 |
| 클라이언트 상태 | Zustand v5 |
| 폼 검증 | React Hook Form + Zod |
| HTTP | Axios |
| 차트 | Recharts |
| 알림 | Sonner |
| 테스트 | Playwright |

### Backend ([레포지토리](https://github.com/SmartChain-HD/Backend))

| 분류 | 기술 |
|------|------|
| 프레임워크 | Java 17, Spring Boot 3.2, Spring Security 6 |
| 데이터베이스 | PostgreSQL 16 (Azure) |
| 스토리지 | Azure Blob Storage |
| OCR / AI | Naver Clova OCR, OpenAI GPT-4o, LangChain |

### AI Service ([레포지토리](https://github.com/SmartChain-HD/AI))

| 분류 | 기술 |
|------|------|
| 프레임워크 | FastAPI + Uvicorn |
| LLM | GPT-4o-mini (텍스트 분석), GPT-5.1 (이미지·멀티모달 분석) |
| OCR | Naver Clova OCR V2 |
| 객체 감지 | YOLO26n — CrowdHuman Few-shot (인원수 탐지) |
| 벡터 DB | ChromaDB (RAG 챗봇) |
| 파싱 | PyMuPDF (PDF), pandas (XLSX) |

### Infra

| 분류 | 기술 |
|------|------|
| 배포 | Azure Container Apps |
| CI/CD | GitHub Actions |
| 보안 | Azure Key Vault (Managed Identity 기반 Zero-Secret) |
| 모니터링 | Application Insights, Log Analytics (KQL) |

---

## 시스템 아키텍처

```
┌─────────────────────────────────────────────────┐
│              Presentation Tier                   │
│         React + Vite (Azure Container Apps)      │
└──────────────────────┬──────────────────────────┘
                       │ REST API
┌──────────────────────▼──────────────────────────┐
│              Application Tier                    │
│       Spring Boot 3.2 (Azure Container Apps)     │
│                                                  │
│  ┌──────────────┐   ┌────────────────────────┐   │
│  │  Main API    │   │  AI Service (FastAPI)  │   │
│  │  (Spring)    │──▶│  :8000 ai_run_api      │   │
│  │              │   │  :8001 chatbot_api     │   │
│  │              │   │  :8002 out_risk_api    │   │
│  └──────┬───────┘   └────────────────────────┘   │
└─────────┼───────────────────────────────────────┘
          │
┌─────────▼───────────────────────────────────────┐
│                  Data Tier                       │
│   Azure PostgreSQL 16    Azure Blob Storage      │
│   Google News RSS        (증빙 파일 저장)          │
└─────────────────────────────────────────────────┘
```

### AI 파이프라인 (문서 검증)

```
파일 업로드
    │
    ▼
① 분류 (파일명·형식·헤더·키워드 기반)
    │
    ▼
② 슬롯 매핑 (도메인별 필수 항목 체크)
    │
    ▼
③ 추출 (OCR / PyMuPDF / pandas)
    │
    ▼
④ 검증 (형식 오류 / 기간 불일치 / 판독 불가)
    │
    ▼
⑤ 교차 검증 (Excel 월합계 ↔ 고지서 사용량 등)
    │
    ▼
⑥ 최종 판정 → PASS / NEED_FIX / NEED_CLARIFY
```

---

## 라우팅

| 경로 | 페이지 | 접근 권한 |
|------|--------|----------|
| `/` | 온보딩 | Public |
| `/login` | 로그인 | Public |
| `/signup/step1` | 회원가입 1단계 (개인정보 활용 동의) | Public |
| `/signup/step2` | 회원가입 2단계 (개인정보 입력) | Public |
| `/change-password` | 비밀번호 변경 | 로그인 필요 |
| `/permission/request` | 권한 신청 | 로그인 필요 |
| `/permission/status` | 권한 신청 상태 확인 | 로그인 필요 |
| `/permission/management` | 권한 관리 (관리자) | 로그인 필요 |
| `/notifications` | 알림 목록 | 멤버 이상 |
| `/dashboard` | 역할별 대시보드 | 멤버 이상 |
| `/dashboard/{domain}/upload` | 파일 업로드 | 도메인 권한 필요 |
| `/dashboard/{domain}/review/:id` | 문서 검토 상세 | 도메인 권한 필요 |
| `/dashboard/compliance/review/:id/ai-analysis` | AI 분석 결과 | 도메인 권한 필요 |

> `{domain}` = `safety` / `compliance` / `esg`

---

## 역할별 대시보드

### 수신자 (원청 / REVIEWER)
- 통계 카드: 전체 협력사 / 미제출 / 검토중 / 보완요청 / 완료
- 협력사 리스크 관리 테이블
- 외부 리스크 패널 (뉴스 기반 ESG 리스크 점수)

### 기안자 (협력사 작성 직원 / DRAFTER)
- 통계 카드: 미제출 / 검토중 / 보완요청 / 완료
- 제출 필요 기안 테이블
- 실시간 알림 피드

### 결재자 (협력사 팀장 / APPROVER)
- 통계 카드: 제출 대기 / 검토중 / 보완요청 / 완료
- 검토 필요 리스트 테이블
- 실시간 알림 피드

---

## 시작하기

### 설치

```bash
npm install
```

### 환경 변수 설정

`.env` 파일을 프로젝트 루트에 생성하세요:

```env
VITE_API_BASE_URL=https://<백엔드 도메인>/api
```

### 개발 서버 실행

```bash
npm run dev
```

### 빌드

```bash
npm run build
```

### E2E 테스트

```bash
npx playwright test
```

---

## 프로젝트 구조

```
/
├── App.tsx                        # 라우팅 및 앱 진입점
├── main.tsx                       # React 마운트 포인트
│
├── features/                      # 도메인 기반 기능 모듈
│   ├── auth/                      # 로그인, 회원가입, 비밀번호 변경
│   ├── dashboard/                 # 역할별 대시보드
│   ├── documents/                 # 파일 업로드, 문서 검토, AI 분석
│   ├── diagnostics/               # 진단 목록/상세/생성/파일
│   ├── reviews/                   # 검토 목록
│   ├── approvals/                 # 결재 상세
│   ├── permission/                # 권한 신청/상태/관리
│   ├── notifications/             # 알림
│   ├── management/                # 사용자·회사 관리, 활동 로그
│   └── onboarding/                # 온보딩
│
├── shared/                        # 공통 컴포넌트 및 레이아웃
│
├── src/
│   ├── api/                       # API 클라이언트 모듈
│   ├── constants/                 # 쿼리 키 등 전역 상수
│   ├── hooks/                     # 커스텀 훅 (useQuery / useMutation)
│   ├── store/                     # Zustand 스토어 (인증)
│   ├── types/                     # 전역 타입 정의
│   └── utils/                     # 유틸리티 함수
│
├── styles/
│   ├── globals.css                # 전역 스타일
│   └── token/
│       ├── token.css              # 컬러·Border Radius·Shadow 토큰
│       └── typography.css         # 타이포그래피 시스템
│
└── docs/                          # 프로젝트 문서 (API 명세, ERD 등)
```

---

## 디자인 시스템

### 컬러 토큰

```css
--color-primary-main:    #003087   /* 현대중공업 브랜드 */
--color-primary-dark:    #002554
--color-success-main:    #00AD1D   /* Forward to Green */
--color-page-bg:         #F8F9FA   /* 페이지 배경 */
--color-surface-primary: #EFF4FC   /* Surface */
```

### 타이포그래피

```css
.font-display-large    /* 64px */
.font-heading-large    /* 32px — 페이지 타이틀 */
.font-title-large      /* 20px */
.font-title-small      /* 16px — 카드 타이틀 */
.font-body-medium      /* 16px */
.font-body-small       /* 14px */
.font-detail-medium    /* 14px */
```

### Border Radius

```css
--radius-card:    48px   /* 메인 카드 */
--radius-default: 20px   /* 버튼, 인풋 */
--radius-small:   12px
--radius-badge:   24px
```

---

## 팀

| 이름 | 역할 |
|------|------|
| 이종헌 | PM, FE, BE, Infra |
| 이수오 | 인프라 리더, BE |
| 김건우 | FE, BE, Infra |
| 진지현 | 풀스택 리더, FE, BE |
| 박세용 | FE, BE |
| 이수빈 | AI 리더, AI |
| 배수한 | AI, FE |

---

## 관련 레포지토리

| 파트 | 링크 |
|------|------|
| Frontend (본 레포) | `SmartChain-HD/smartchainFE` |
| Backend | [SmartChain-HD/Backend](https://github.com/SmartChain-HD/Backend) |
| AI Service | [SmartChain-HD/AI](https://github.com/SmartChain-HD/AI) |

---

**Last Updated**: 2026-02-19
**Version**: 0.1.0
**Project**: KT AIVLE School 8기 빅프로젝트 — AI 기반 협력사 리스크 관리 플랫폼
