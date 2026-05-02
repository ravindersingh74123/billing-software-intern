// const express=require("express")
// const app=express()

// const users=[]

// app.use(express.json())
// app.post("/signup",(req,res)=>{
//   const username=req.body.username
//   const password=req.body.password

  

//   res.send("done! lund")
// })

// app.listen(3000)


const jwt=require("jsonwebtoken");
let token="";
const jwtsecret="secret";

function signjwt(username,password){
  token=jwt.sign({username,password},jwtsecret);
  return token;
}
function verify(token){
  return jwt.verify(token,jwtsecret)?console.log(true):console.log(false);
}
function decod(token){
  const decoded=jwt.decode(token,jwtsecret)
  console.log(decoded.username)
}

console.log(signjwt("myname","mypassword"))

decod(token)
verify(token)