
const router = require('express').Router();

const connection = require('../mysql/mysql');

router.get('/',(req,res)=>{
  console.log('칸반 데이터 요청!');
  const queries = {
    kanban_undo: 'SELECT * FROM kanban_undo',
    kanban_progress: 'SELECT * FROM kanban_progress',
    kanban_done: 'SELECT * FROM kanban_done'
  };

  // 데이터를 저장할 객체
  const results = {};

  // 비동기적으로 쿼리를 실행하는 함수
  const fetchData = (table, query) => {
    return new Promise((resolve, reject) => {
      connection.query(query, (err, rows) => {
        if (err) {
          return reject(err);
        }
        results[table] = rows;
        resolve();
      });
    });
  };

  // 모든 쿼리를 실행하고 결과를 가져옴
  Promise.all(Object.entries(queries).map(([table, query]) => fetchData(table, query)))
    .then(() => {
      // 모든 쿼리가 성공적으로 실행된 후, 결과를 클라이언트에 반환
      // console.log(results);
      res.status(200).json(results);
    })
    .catch((err) => {
      console.error('쿼리 실행 오류:', err);
      res.status(500).json({ error: '쿼리 실행 중 오류 발생' });
    });

});


// 칸반보드 일괄 업데이트
router.put('/', (req,res)=>{

  console.log('칸반 업데이트 요청!');

  const { undo, progress, done } = req.body;

  // Transaction을 사용하여 모든 작업을 원자적으로 처리
  connection.beginTransaction((err) => {
    if (err) {
      console.error('트랜잭션 시작 오류:', err);
      return res.status(500).json({ error: '트랜잭션 시작 중 오류 발생' });
    }

    // 모든 데이터를 삭제하고 새로 삽입
    const tables = ['kanban_undo', 'kanban_progress', 'kanban_done'];
    const data = { kanban_undo: undo, kanban_progress: progress, kanban_done: done };

    const deleteTableData = (table, callback) => {
      connection.query(`DELETE FROM ${table}`, (err) => {
        if (err) {
          console.error(`테이블 ${table} 데이터 삭제 오류:`, err);
          return callback(err);
        }
        callback(null);
      });
    };

    const insertData = (table, items, callback) => {
      if (items.length === 0) {
        return callback(null);
      }

      const query = `
        INSERT INTO ${table} (kanban_id, title, sDate, eDate, content)
        VALUES ?
      `;
      const values = items.map(item => [
        item.kanban_id,
        item.title,
        item.sDate ? item.sDate.split('T')[0] : null,
        item.eDate ? item.eDate.split('T')[0] : null,
        item.content
      ]);

      connection.query(query, [values], (err) => {
        if (err) {
          console.error(`테이블 ${table} 데이터 삽입 오류:`, err);
          return callback(err);
        }
        callback(null);
      });
    };

    // 순차적으로 각 테이블의 데이터를 삭제하고 새 데이터를 삽입
    let index = 0;
    const processNextTable = () => {
      if (index >= tables.length) {
        return connection.commit((err) => {
          if (err) {
            console.error('트랜잭션 커밋 오류:', err);
            return connection.rollback(() => res.status(500).json({ error: '트랜잭션 커밋 중 오류 발생' }));
          }
          res.status(200).json({ message: '테이블 데이터가 성공적으로 초기화되고 삽입되었습니다.' });
        });
      }

      const table = tables[index];
      deleteTableData(table, (err) => {
        if (err) {
          return connection.rollback(() => res.status(500).json({ error: '테이블 데이터 삭제 중 오류 발생' }));
        }

        insertData(table, data[table], (err) => {
          if (err) {
            return connection.rollback(() => res.status(500).json({ error: '테이블 데이터 삽입 중 오류 발생' }));
          }

          index++;
          processNextTable();
        });
      });
    };

    processNextTable();
  });
});




router.get('/unload', (req, res) => {
  console.log('종료 get 요청');

  try {
    // 쿼리 스트링 값이 JSON 형식일 경우 파싱
    const undo = JSON.parse(req.query.undo); 
    const progress = JSON.parse(req.query.progress); 
    const done = JSON.parse(req.query.done);


  // Transaction을 사용하여 모든 작업을 원자적으로 처리
  connection.beginTransaction((err) => {
    if (err) {
      console.error('트랜잭션 시작 오류:', err);
      return res.status(500).json({ error: '트랜잭션 시작 중 오류 발생' });
    }

    // 모든 데이터를 삭제하고 새로 삽입
    const tables = ['kanban_undo', 'kanban_progress', 'kanban_done'];
    const data = { kanban_undo: undo, kanban_progress: progress, kanban_done: done };

    const deleteTableData = (table, callback) => {
      connection.query(`DELETE FROM ${table}`, (err) => {
        if (err) {
          console.error(`테이블 ${table} 데이터 삭제 오류:`, err);
          return callback(err);
        }
        callback(null);
      });
    };

    const insertData = (table, items, callback) => {
      if (items.length === 0) {
        return callback(null);
      }

      const query = `
        INSERT INTO ${table} (kanban_id, title, sDate, eDate, content)
        VALUES ?
      `;
      const values = items.map(item => [
        item.kanban_id,
        item.title,
        item.sDate ? item.sDate.split('T')[0] : null,
        item.eDate ? item.eDate.split('T')[0] : null,
        item.content
      ]);

      connection.query(query, [values], (err) => {
        if (err) {
          console.error(`테이블 ${table} 데이터 삽입 오류:`, err);
          return callback(err);
        }
        callback(null);
      });
    };

    // 순차적으로 각 테이블의 데이터를 삭제하고 새 데이터를 삽입
    let index = 0;
    const processNextTable = () => {
      if (index >= tables.length) {
        return connection.commit((err) => {
          if (err) {
            console.error('트랜잭션 커밋 오류:', err);
            return connection.rollback(() => res.status(500).json({ error: '트랜잭션 커밋 중 오류 발생' }));
          }
          res.status(200).json({ message: '테이블 데이터가 성공적으로 초기화되고 삽입되었습니다.' });
        });
      }

      const table = tables[index];
      deleteTableData(table, (err) => {
        if (err) {
          return connection.rollback(() => res.status(500).json({ error: '테이블 데이터 삭제 중 오류 발생' }));
        }

        insertData(table, data[table], (err) => {
          if (err) {
            return connection.rollback(() => res.status(500).json({ error: '테이블 데이터 삽입 중 오류 발생' }));
          }

          index++;
          processNextTable();
        });
      });
    };

    processNextTable();
  });

    // 정상적인 요청일 경우 응답
    // res.status(200).json('------ 서버에서 칸반 요청 받음! ------');
  } catch (error) {
    // JSON 파싱에 실패한 경우 에러 메시지를 응답
    console.error('JSON 파싱 오류:', error);
    res.status(400).json({ error: '잘못된 쿼리 스트링 형식입니다.' });
  }

  return;
});







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