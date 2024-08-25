const mysql = require('mysql2');


// MySQL 연결 설정
// mysql에 접근하는 경우 connection 에 쿼리문 작성
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: process.env.SQL_PW, // 본인의 MySQL 비밀번호로 변경해주세요
  database: 'kanban' // 본인의 MySQL 데이터베이스 이름으로 변경해주세요
});

module.exports = connection;