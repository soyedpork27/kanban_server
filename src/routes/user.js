
const router = require('express').Router();

router.get('/', (req,res)=>{

  console.log(req.body);
  res.status(200).json('요청 확인!');

  return;

})


// // GET 요청 핸들러
// router.get('/', (req, res) => {
//   // routine 테이블 조회
//   connection.query('SELECT * FROM routine', (err, results, fields) => {
//     if (err) {
//       // console.error('쿼리 실행 에러: ' + err.stack);
//       res.status(500).json({ error: '데이터베이스 조회 중 오류가 발생했습니다.' });
//       return;
//     }
//     // console.log('routine 테이블 조회 결과:', results);
//     res.json(results); // 조회 결과를 JSON 형식으로 응답
//   });
// });


// router.post('/create' ,auth , async (req,res) => {
//   const user = req.user;
//   const userId = user._id.toHexString(); // ObjectId를 16진수 문자열로 변환

//   let newData ;

//   // 해당 유저의 루틴 수 파악하기 위한 쿼리문
//   connection.query(
//     `
//     SELECT count(*) AS num_records FROM routine where routine_key = ?;
//     `,
//     [userId],
//     (err,result,fields) => {
//       if(result[0].num_records >=5){
//         return res.status(400).send('루틴의 개수는 최대 5개 입니다.');
//       }
//       newData = {routine : result[0].num_records+1};
//     }
//   );




module.exports = router;