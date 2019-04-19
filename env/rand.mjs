const rand = () => Math.random().toString(36).substring(2, 15);

function rand_controlled(length = 32){
    let res = '';
    while (res.length < length) res += rand();
    return res.slice(0, length - res.length) || rand_controlled(length)
}

export default rand_controlled
