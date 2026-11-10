import { cn } from "@/lib/utils";
import { useLayoutEffect, useState, type CSSProperties } from "react";

interface RollingNumberProps {
    value: number;
    className?: string;
}

const RollingNumber = ({ value, className }: RollingNumberProps) => {
    const [rollingValue, setRollingValue] = useState({ previous: value, current: value, direction: 0 });

    useLayoutEffect(() => {
        setRollingValue((previous) => previous.current === value ? previous : {
            previous: previous.current,
            current: value,
            direction: value > previous.current ? 1 : -1,
        });
    }, [value]);

    const formattedValue = new Intl.NumberFormat().format(rollingValue.current);
    const previousDigits = Array.from(new Intl.NumberFormat().format(rollingValue.previous))
        .reverse()
        .filter((character) => /[0-9]/.test(character))
        .map(Number);
    let digitPlace = 0;
    const characters = Array.from(formattedValue).reverse().map((character) => {
        const isDigit = /[0-9]/.test(character);
        const place = digitPlace;
        if (isDigit) digitPlace += 1;
        return { character, isDigit, place };
    }).reverse();

    return (
        <span className={cn("inline-flex tabular-nums", className)} dir="ltr">
            <span className="sr-only">{formattedValue}</span>
            <span aria-hidden="true" className="inline-flex">
                {characters.map(({ character, isDigit, place }, index) => isDigit ? (
                    <span key={`digit-${place}`} className="inline-flex h-[1em] w-[0.62em] justify-center overflow-hidden align-bottom">
                        <span
                            key={`${rollingValue.current}-${place}`}
                            className={cn("flex h-[30em] shrink-0 flex-col self-start", rollingValue.direction !== 0 && "rolling-digit-track")}
                            style={getDigitTrackStyle(Number(character), previousDigits[place] ?? 0, rollingValue.direction)}
                        >
                            {Array.from({ length: 30 }, (_, index) => (
                                <span key={index} className="h-[1em] shrink-0 leading-none">{index % 10}</span>
                            ))}
                        </span>
                    </span>
                ) : (
                    <span key={`separator-${index}-${character}`} className="inline-flex h-[1em] items-center">
                        {character}
                    </span>
                ))}
            </span>
        </span>
    );
};

function getDigitTrackStyle(digit: number, previousDigit: number, direction: number): CSSProperties {
    const distance = direction > 0
        ? (digit - previousDigit + 10) % 10
        : direction < 0
            ? -((previousDigit - digit + 10) % 10)
            : 0;
    const from = 10 + previousDigit;
    const to = from + distance;

    return {
        "--roll-from": `-${from}em`,
        "--roll-to": `-${to}em`,
        transform: `translateY(-${to}em)`,
    } as CSSProperties;
}

export { RollingNumber };