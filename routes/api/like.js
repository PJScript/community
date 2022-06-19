const express = require('express')
const router = express.Router();

const User = require('../../schema/user')
const Board = require('../../schema/board')
const Token = require('../../schema/token')
const JWT = require('../../utils/jwtUtil')
const Date = require('../../utils/dateUtil')

// 서버 요구사항 여부 검증
router.use('/', (req, res, next) => {
    if (!req.headers.authorization) {
        res.status(404).send("not found token");
        return;
    } else {
        next();
    }
    console.log("test")
})


router.post('/:id', (req, res, next) => {
    const { authorization } = req.headers
    const token = authorization.split(' ')[1]
    const verifyToken = JWT.verify(token)
    const { id } = req.params

    if (!verifyToken.success) {
        res.status(404).send();
        return;
    }
    if (!id) {
        res.status(404).send("check api docs");
        return;
    }

    const { email } = verifyToken
    let Boolean = true
    User.findOne({ email: email }).then((userData) => {
        console.log(userData)
        const nickname = userData.nickname
        const email = userData.email
        const name = userData.name

        Board.findOne({ _id: id }).then((boardData) => {
            let like = boardData.like
            let like_count = boardData.like_count

            if (like.length === 0) {
                like_count += 1;
                Boolean = true

                like = [{
                    usr_name: name,
                    email: email,
                    created_at: Date.now(),
                    updated_at: Date.now(),
                    deleted_at: null,
                }]
            } else {
                
                for(let i=0; i<=like.length-1; i++){
                   if(like[i].email === email){
                    like = like.filter((el,idx)=>{
                      return el.email !== email
                    })
                     break;
                   }else{
                    like.push(
                        {
                            usr_name: name,
                            email: email,
                            created_at: Date.now(),
                            updated_at: Date.now(),
                            deleted_at: null,
                        }
                    )
                   }
                }

                

                // if (like.length === 0) {
                //     like_count -= 1;
                //     Boolean = false
                // }

            }
            Board.findOneAndUpdate({ _id: id }, { like: like, like_count: like_count }, {
                new: true
            }).then((data) => {
                res.status(200).send({result:Boolean})
                return;
            })
            // console.log(boardData)
        })
    }).catch((err) => {
        console.log(err)
        res.status(404).send();
        return;
    })
});


// router.delete('/cancel/:id', function (req, res, next) {
//     const { authorization } = req.headers
//     const token = authorization.split(' ')[1]
//     const verifyToken = JWT.verify(token)

//     const { id } = req.params

//     res.send('좋아요 취소');
// });


module.exports = router;
