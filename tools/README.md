# tools

## naver_smartstore_products.py

네이버 스마트스토어 카테고리 페이지를 끝까지 넘겨가며 **상품명만** 뽑아
텍스트 파일(메모장에서 바로 열 수 있는 `.txt`)로 저장합니다.

### 준비

```bash
pip install playwright
playwright install chromium
```

### 실행

```bash
python tools/naver_smartstore_products.py \
  "https://smartstore.naver.com/yes24book/category/da522381ebe945058b0a46c11bd8e5cc" \
  -o 상품명.txt
```

`cp`(페이지 번호)는 스크립트가 1부터 자동으로 올려가며, 새 상품이 더 이상
나오지 않으면 멈춥니다. URL에 `cp=2` 같은 값이 들어 있어도 무시하고 1쪽부터
전체를 훑습니다.

### 옵션

| 옵션 | 설명 |
| --- | --- |
| `-o, --out` | 저장할 파일 경로 (기본 `상품명.txt`) |
| `--max-pages` | 최대 페이지 수 (기본 100) |
| `--wait` | 페이지 사이 대기 초 (기본 1.0) |
| `--show` | 브라우저 창을 띄워 진행 상황 확인 |

### 결과 예시

```
체인소 맨 1~23권 세트 / 후지모토 타츠키
...
```

가격·할인율·`무료배송`·리뷰 수 같은 부가 텍스트는 걸러내고 상품명 한 줄씩만
저장합니다. 파일은 윈도우 메모장에서 한글이 깨지지 않도록 BOM 포함 UTF-8로
저장됩니다.
