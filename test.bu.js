const test = require('tape')

const games = [
    { rolls: [], score: 0 },
    { rolls: [1], score: 1 },
    { rolls: [1,9 , 1], score: 12 },
    { rolls:[0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], score: 0 },
    { rolls:[9,1, 9,1, 9,1, 9,1, 9,1, 9,1, 9,1, 9,1, 9,1, 9,1, 9] , score: 190 },
    { rolls:[10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10] , score: 300 },
    { rolls:[1,1 , 1,1 , 1,1 , 1,1 , 1,1 , 1,1 , 1,1 , 1,1 , 1,1 , 1,1] , score: 20 },
    { rolls:[10, 5, 5, 10, 5, 5, 10, 5, 5, 10, 5, 5, 10, 5, 5, 10], score: 200},
    { rolls:[0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 10,1,0], score: 11},
    { rolls:[0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 0,0, 10, 1,0], score: 12}
]

const addFrames = (a, b, i) => {
    return a + (i > 9 ? 0 : ['p', 'sp', 'sk' ].reduce((sum, k) => {
         return sum + b.reduce((bs, n) => bs + n[k] | 0 , 0)
    }, 0))
}
const focusFrame = (frames, idx) => {
    return frames[idx] || [] 
}
const firstRoll = (frame) => frame[0] && frame[0].p || 0
const secondRoll = (frame) => frame[1] && frame[1].p || 0
const isStrike = (frame) => frame.length == 1 && frame[0].p == 10
const isSpare = (frame) => frame.length == 2 && frame[0].p + frame[1].p == 10
const makeFrames = (frames, rolls, [frame, roll]) => {
    if ( rolls.length <= roll ) {
        return frames
    }
    let frameStep = 0
    let rollStep = 1
    if ( frame >= 10 ) {
        frames[frames.length - 1].push({p:rolls[roll]|0})
    } else if( !frames[frame] ) {
        frames[frame] = [{p: rolls[roll]|0}]
    } else if ( isStrike(frames[frame]) ) {
        frameStep = 1
        rollStep = 0
    } else {
        frameStep = 1
        frames[frame][1] = {p: rolls[roll]|0}
    }
    return  makeFrames(frames, rolls, [frame+frameStep, roll+rollStep]) 
}
const addSpareBonus = (frame, i, inputFrames) => {
    return frame.map((v, k) => {
        return k == 0 ? v : isSpare(frame) ? Object.assign(v,{sp: firstRoll(focusFrame(inputFrames, i+1))}) : v
    })
}
const addStrikeBonus = (frame, i, inputFrames) => {
    if (frame.length == 0) return frame
    const nextFrame = focusFrame(inputFrames, i+1)
    const y = isStrike(frame) ? Object.assign(frame[0], {sk: firstRoll(nextFrame) + (nextFrame.length > 1 ? secondRoll(nextFrame) : firstRoll(focusFrame(inputFrames, i+2)))}) : frame[0]
    if (frame.length == 1) return [y]
    if (frame.length == 2) return [y, frame[1]]
    if (frame.length == 3) return [y, frame[1], frame[2]]
}
function calcScore(rolls){
    return makeFrames([], rolls, [0, 0])
        .map(addStrikeBonus)
        .map(addSpareBonus)
        .reduce(addFrames, 0)
}

test(function(t){
    t.plan(games.length)
    games.forEach((game) => {
        t.equal(calcScore(game.rolls), game.score)
    })
    t.end()
})
