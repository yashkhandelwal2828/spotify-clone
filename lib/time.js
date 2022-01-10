export function millisToMinuteAndSeconds(milis){
    const minutes = Math.floor(milis / 60000);
    const seconds  = ((milis % 60000) / 1000).toFixed(0);
    return seconds == 60
        ? minutes + 1 + ":00"
        : minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
}