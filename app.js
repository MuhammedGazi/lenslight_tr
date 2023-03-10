import express from "express";

const app=express();
const port=300;

app.get("/",(req,res)=>{
    res.send('INDEX SAYFASI');
});
app.listen(port,()=>{
    console.log(`application running on port: http://localhost:${port}`);
});