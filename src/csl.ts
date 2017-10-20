import { Observable } from 'rx';
import { map, times, findIndex, slice, take } from 'lodash';

export interface Ribbon {
    title: string;
    tiles: Observable<Tile[]>;
}

export interface Tile {
    id: number;
    title: string;
    thumbnail: string;
    startTime: Date;
    endTime: Date;
    isOnNow: Observable<boolean>;
    currentProgress: Observable<number | undefined>;
}

export default function getRibbon(): Ribbon {
    const tiles = getTiles();
    return {
        title: 'Sample Kids Shows',
        tiles: tilesObservable(tiles)
    };
}

const TenSeconds = 10000;
function getTiles (): Tile[] {
    const tenSecondsAgo = new Date(new Date().getTime() - TenSeconds);
    const startTimes = times(30, i => new Date(tenSecondsAgo.getTime() + (i * TenSeconds)));
    
    return map(startTimes, (startTime, index) => {
        let endTime = new Date(startTime.getTime() + TenSeconds);
        let tile: Tile = {
            id: index,
            title: `Tile #${index}`,
            isOnNow: onNowObservable(startTime, endTime),
            startTime: startTime,
            endTime: endTime,
            thumbnail: index % 2 === 0 ? 
                'http://q-img.movetv.com/cms/images/m/213/160/7cc520bcff89eea348988b8938d131c97104545d.jpg' :
                'http://q-img.movetv.com/cms/images/m/213/160/c2285e67d78d71ce9a07f4485984eda07cdeefb6.jpg',
            currentProgress: currentProgressObservable(startTime, endTime)
        };
        return tile;
    });
}

// Observable Functions
function tilesObservable(tiles: Tile[]): Observable<Tile[]> {
    return Observable
        .interval(TenSeconds)
        .delay(10)
        .map(() => {
            const rightNow = new Date().getTime();
            const onNowIndex = findIndex(tiles, t =>
                t.startTime.getTime() <= rightNow && rightNow < t.endTime.getTime());
            return take(slice(tiles, onNowIndex - 1), 10);
        })
        .startWith(take(tiles, 10));
}

function onNowObservable(startTime: Date, endTime: Date): Observable<boolean> {
    return Observable
        .interval(TenSeconds)
        .delay(10)
        .map(() => {
            const rightNow = new Date().getTime();
            return startTime.getTime() <= rightNow && rightNow < endTime.getTime();
        });
}

function currentProgressObservable(startTime: Date, endTime: Date): Observable<number | undefined> {
    return Observable
        .interval(50)
        .map(() => {
            const rightNow = new Date().getTime();
            const numericStartTime = startTime.getTime();
            return numericStartTime <= rightNow && rightNow < endTime.getTime()
                ? (rightNow - numericStartTime) / TenSeconds
                : undefined;
        });
}
