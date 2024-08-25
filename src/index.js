const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// 환경변수 사용하기
dotenv.config();

const port = 9812;

// express 모듈 시작
const app = express();

app.use(express.json());

// cors 허용

const allowedOrigins = [
  'http://localhost:3000',
  'https://kwskanban.netlify.app/'
];

app.use(cors({
  origin: function (origin, callback) {
    // 만약 요청의 출처가 허용된 출처 목록에 포함되어 있다면
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));

// 정적 경로 설정
app.use(express.static(path.join(__dirname, '../uploads')));

const connection = require('./mysql/mysql');

// MySQL 연결
connection.connect((err) => {
  if (err) {
    console.error('MySQL 연결 실패:', err);
    return;
  }
  console.log('MySQL 연결 성공!');
});

// 유저 라우터 사용하기
const userRouter = require('./routes/user');
app.use('/user',userRouter);


// 칸반 라우터 사용하기
const kanbanRouter = require('./routes/kanban');
app.use('/kanban',kanbanRouter);





app.listen(port, ()=>{
  console.log(port+' 번 port 에서 express 서버 실행!');
});