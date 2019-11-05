function irand(max,min=0){
    return Math.floor( Math.random() * (max + 1 - min) ) + min;
}
function logb(x, y) {
    return Math.log(y) / Math.log(x);
}
function isString(obj) {
    return typeof (obj) == "string" || obj instanceof String;
}
function isArray(obj){
    return typeof (obj) == "Array" || obj instanceof Array;
}
function addArray(a,b){
    var t=new Array(a.length);
    for(var i=0;i<a.length;i++){
        t[i]=a[i]+b[i];
    }
    return t;
}
function diffArray(a, b) {
    if (!Array.isArray(a))    return false;
    if (!Array.isArray(b))    return false;
    if (a.length != b.length) return false;
    let num=a.length,i=0;
    for (let x of a) {
        for (let y of b) {
            if(x==y)i++;
        }
        if(i==0)return false;
    }
    return num==i?true:false;
} 
function getInt(ar){
    var value = 0;
    for (var  i=0;i<ar.length;i++){
        value = (value << 8) + ar[i];
    }
    return value;
}
function getChar(ar){
    var value = 0;
    for (var  i=0;i<ar.length;i++){
        value += String.fromCharCode(ar[i]);
    }
    return value;
}
function getxInt(ar){
    var value = 0;
    for (var  i=0;i<ar.length;i++){
        value = (value << 8) + ar[i];
    }
    return value.toString(16);
}
function snap16(ar){
    var value=new Array();
    for (var  i=0;i<ar.length;i++){
        value
    }
    return value;
}