const test = require('tape')

const games = [
    { rolls: [], score: 0 },
    { rolls: [1], score: 1 },
    { rolls: [1, 9, 1], score: 12 },
    { rolls:[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], score: 0 },
    { rolls:[9,1, 9,1, 9,1, 9,1, 9,1, 9,1, 9,1, 9,1, 9,1, 9,1, 9] , score: 190 },
    { rolls:[10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10] , score: 300 },
    { rolls:[1,1 , 1,1 , 1,1 , 1,1 , 1,1 , 1,1 , 1,1 , 1,1 , 1,1 , 1,1] , score: 20 },
    { rolls:[10, 5, 5, 10, 5, 5, 10, 5, 5, 10, 5, 5, 10, 5, 5, 10], score: 200},
    { rolls:[0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0 , 10, 1,0], score: 11},
    { rolls:[0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 10, 1,0], score: 12},
    { rolls:[0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 5,5 , 1,0], score: 12},
    { rolls:[0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 5,5 , 5,5,3], score: 28}
]

test(function(t){
    t.plan(games.length)
    games.forEach((game) => {
        t.equal(calcScore(game.rolls), game.score)
    })
    t.end()
})

// const maker
const C = function(c){
    const o = {[c]:(x) => x !== undefined ? x === o[c] : o[c]}
    return o[c]
}

// predicates

const firstRoll = C("first roll")
const strike = C("strike")
const secondRoll = C("2nd roll")
const spare = C("spare")
const extra = C("extra")
const newFrame = (r) => r == 10 ? strike : firstRoll

const eq = (x) => (y) => x == y
const not = (x) => (y) => x != y
const any = () => true
const lt10 = (x) => x < 10

const states = [
    {frameCond:eq(0), currentState:not(firstRoll), nextState:newFrame},
    {frameCond:any, currentState:firstRoll, nextState:(r, pr) => r + pr == 10 ? spare : secondRoll},
    {frameCond:lt10, currentState:strike, nextState:newFrame},
    {frameCond:lt10, currentState:spare, nextState:newFrame},
    {frameCond:lt10, currentState:secondRoll, nextState:newFrame},
    {frameCond:eq(10), currentState:strike, nextState:extra}
]

const addFrames = ([frameIdx, state, ppRoll, pRoll, sum], roll) => {
    const nextFrameIdx = [secondRoll, spare, strike].includes(state) ? frameIdx + 1 : frameIdx 
    const n = states.find(({frameCond:pf, currentState:ps}) => pf(frameIdx) && ps(state))
    const nextState = n.nextState(roll, pRoll)
    const spareBonus = spare == state && nextFrameIdx < 10 ? roll : 0 
    const strikeBonus = strike == state && nextFrameIdx < 10 ? roll : 0
    const pStrikeBonus = ppRoll == 10 && nextFrameIdx <= 10 ? roll : 0 
    const total = sum + roll + spareBonus + strikeBonus + pStrikeBonus
    return [nextFrameIdx, nextState, pRoll, roll, total]
}

const calcScore = (rolls) => rolls.reduce(addFrames, [0, any, 0, 0, 0])[4]
