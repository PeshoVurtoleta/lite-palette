import { parseOklch, toCssOklch, lerpOklch, multiStopGradient } from "@zakkster/lite-color";

export class ColorScale {
    static linear(startStr, endStr, steps = 5) {
        if (steps <= 1) return [toCssOklch(parseOklch(startStr))];

        const start = parseOklch(startStr);
        const end = parseOklch(endStr);
        const scale = new Array(steps);

        for (let i = 0; i < steps; i++) {
            scale[i] = toCssOklch(lerpOklch(start, end, i / (steps - 1)));
        }

        return scale;
    }

    static multiStop(stops, totalSteps = 10) {
        if (stops.length === 0) return [];
        if (stops.length < 2 || totalSteps <= 1) {
            return [toCssOklch(parseOklch(stops[0]))];
        }

        const result = new Array(totalSteps);
        const parsedStops = stops.map(parseOklch);

        for (let i = 0; i < totalSteps; i++) {
            const t = i / (totalSteps - 1);
            result[i] = toCssOklch(multiStopGradient(parsedStops, t));
        }

        return result;
    }
}