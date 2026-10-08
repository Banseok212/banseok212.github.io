# Banseok Lee — Research Homepage

Jekyll + GitHub Pages로 만든 개인 연구 홈페이지입니다. (구조 참고: joonanlab.github.io)

## 페이지 구성
| 메뉴 | 파일 | 내용 수정 |
|---|---|---|
| Home | `index.html` | `_data/home.yml`, `_data/news.yml` |
| Research | `research.html` | `_data/research.yml` |
| About | `about.html` | `_data/profile.yml` |
| Publications | `publications.html` | `_data/publications.yml` |
| Tools | `tools.html` | `_data/tools.yml` (+ `_config.yml`의 `github_username`) |

사이트 제목, 메뉴, GitHub 아이디는 `_config.yml`에서 바꿉니다.
색상은 `assets/css/style.css` 맨 위의 `--teal`, `--teal-bright`, `--coral`을 바꾸면 됩니다.
글꼴: 제목 Bricolage Grotesque · 본문 Pretendard · 라벨 IBM Plex Mono.

## 개인 문서
이력서 같은 비공개 파일은 `_private/` 폴더에 두세요. 사이트 빌드와 git 업로드에서 모두 제외됩니다.

## 배포
1. GitHub에 `아이디.github.io` 이름으로 새 저장소를 만듭니다.
2. 이 폴더를 그 저장소에 push 합니다.
3. 저장소 Settings → Pages에서 Source를 `main` 브랜치로 설정합니다.
4. 1~2분 후 `https://아이디.github.io` 에서 확인할 수 있습니다.

## 로컬 미리보기
Ruby 3 이상이 있으면:
```bash
bundle install
bundle exec jekyll serve   # http://localhost:4000
```
