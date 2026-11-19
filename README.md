# 자기소개 웹앱 (클라우드 데이터베이스)

클라우드 데이터베이스 수업에서 설계·구현한 DB 프로젝트와 배운 점을 소개하는 원페이지 사이트입니다.

## 구성

| 화면 | 내용 |
|---|---|
| S01 Home | 이름, 한 줄 소개, 프로필 사진, 상단 고정 메뉴 |
| S02 소개 | 소속, 관심 분야, 사용 기술, 이번 학기에 배운 것 |
| S03 프로젝트 | 프로젝트 카드 3개 + 자세히 보기 상세 창 ([기능 1]) |
| S04 연락처 | 이메일(mailto), GitHub 링크 |
| S05 방명록 | 작성 ([기능 2]), 최신순 10개 + 더 보기 ([기능 3]) |

```
index.html
css/style.css
js/data.js   # 프로젝트 데이터 (DynamoDB Projects 표와 같은 구조)
js/app.js    # 화면 로직, api 계층 (AppSync 연동 시 이 부분만 교체)
img/profile.svg
```

## 아키텍처

```
브라우저 ──HTTPS──> CloudFront ──OAC──> S3 (퍼블릭 액세스 차단)
    └──GraphQL(API 키)──> AppSync ──> DynamoDB (Projects, Guestbook)
```

현재 단계(12주차): 정적 파일을 S3에 올리고 CloudFront(OAC)로만 접근하도록 배포했습니다.
AppSync·DynamoDB 연동 전까지 프로젝트는 `js/data.js`, 방명록은 브라우저 localStorage에 임시 저장합니다.

## 로컬 실행

```bash
python -m http.server 8765
# http://localhost:8765
```

## 배포 (S3 업로드 + CloudFront 캐시 무효화)

```bash
aws s3 sync . s3://<버킷 이름> --exclude ".git/*" --exclude "README.md" --exclude ".gitignore" --exclude "deploy/*" --delete
aws cloudfront create-invalidation --distribution-id <배포 ID> --paths "/*"
```
