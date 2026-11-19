// Temporary data source used until the AppSync + DynamoDB backend is connected.
// Shape mirrors the planned DynamoDB "Projects" table (PK: projectId).
window.PROJECTS = [
  {
    projectId: "p1",
    displayOrder: 1,
    title: "동네 도서관 대출 DB",
    summary: "회원·도서·대출 관계를 모델링해 대출 이력과 연체를 조회하는 DB",
    tags: ["PostgreSQL", "ERD", "SQL"],
    period: "2026.09 ~ 2026.10",
    role: "개인 프로젝트 (설계·구현 전체)",
    tech: "PostgreSQL, pgAdmin, SQL",
    tables: [
      { name: "Member", pk: "member_id", fk: "-" },
      { name: "Book", pk: "book_id", fk: "-" },
      { name: "Loan", pk: "loan_id", fk: "member_id → Member, book_id → Book" }
    ],
    result: "대출·반납 이력을 하나의 Loan 테이블로 분리해 회원별·도서별 대출 현황과 연체 목록을 JOIN 한 번으로 조회할 수 있게 했다.",
    lesson: "다대다 관계는 연결 테이블로 풀어야 중복 없이 이력을 남길 수 있다는 점을 배웠다."
  },
  {
    projectId: "p2",
    displayOrder: 2,
    title: "1NF~5NF 정규화 실습",
    summary: "비정규 주문 표를 단계별로 분해하며 각 정규형의 조건을 확인한 실습",
    tags: ["정규화", "SQLite", "Python(Colab)"],
    period: "2026.10",
    role: "개인 실습",
    tech: "SQLite, Python(Colab)",
    tables: [
      { name: "Customer", pk: "customer_id", fk: "-" },
      { name: "Orders", pk: "order_id", fk: "customer_id → Customer" },
      { name: "OrderItem", pk: "(order_id, product_id)", fk: "order_id → Orders, product_id → Product" },
      { name: "Product", pk: "product_id", fk: "-" }
    ],
    result: "반복 그룹·부분 종속·이행 종속·다치 종속을 차례로 제거해 삽입·삭제·갱신 이상이 사라지는 것을 쿼리로 확인했다.",
    lesson: "정규화는 표를 쪼개는 일이 아니라 함수 종속을 찾아 근거 있게 나누는 일이라는 점을 배웠다."
  },
  {
    projectId: "p3",
    displayOrder: 3,
    title: "유학원 상담폼 DB 설계",
    summary: "종이 상담 양식을 개체로 나누고 주키·참조키로 연결한 설계",
    tags: ["데이터 모델링", "PK·FK", "ERD"],
    period: "2026.11",
    role: "개인 설계",
    tech: "개념·논리·물리 모델링, PostgreSQL",
    tables: [
      { name: "Student", pk: "student_id", fk: "-" },
      { name: "Counselor", pk: "counselor_id", fk: "-" },
      { name: "Consultation", pk: "consultation_id", fk: "student_id → Student, counselor_id → Counselor" },
      { name: "DesiredSchool", pk: "(consultation_id, school_id)", fk: "consultation_id → Consultation, school_id → School" },
      { name: "School", pk: "school_id", fk: "-" }
    ],
    result: "한 학생이 여러 번 상담받고, 상담마다 희망 학교가 여러 개인 구조를 개체와 관계로 정리했다.",
    lesson: "양식의 칸을 그대로 컬럼으로 옮기지 않고, 반복되는 항목을 별도 개체로 분리해야 한다는 점을 배웠다."
  }
];
