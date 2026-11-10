import { cn } from "@/lib/utils";

interface RollingNumberProps {
    value: number;
    className?: string;
}

const RollingNumber = ({ value, className }: RollingNumberProps) => {
    const formattedValue = new Intl.NumberFormat().format(value);
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
                            className="flex h-[10em] shrink-0 flex-col self-start transition-transform duration-500 ease-out motion-reduce:transition-none"
                            style={{ transform: `translateY(-${Number(character) * 10}%)` }}
                        >
                            {Array.from({ length: 10 }, (_, digit) => (
                                <span key={digit} className="h-[1em] shrink-0 leading-none">{digit}</span>
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

export { RollingNumber };