import {
    ComponentProps,
    MutableRefObject,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import styled from "styled-components";
import {
    CELL_COUNT,
    CELL_HEIGHT,
    CELL_WIDTH,
    PANEL_COUNT,
    SPREADSHEET_SIZE,
} from "../spreadsheet/spreadsheet.constants";
import { SpreadsheetUtils } from "./spreadsheet.utils";

const SPREADSHEET_PANELS = Array.from(Array(PANEL_COUNT * PANEL_COUNT));
const PANEL_CELLS = Array.from(Array(CELL_COUNT * CELL_COUNT));

interface UseRenderedPanelsProps {
    containerRef: MutableRefObject<HTMLDivElement>;
}

const useRenderedPanels = ({ containerRef }: UseRenderedPanelsProps) => {
    const [renderedPanels, setRenderedPanels] = useState(new Set<number>());

    useEffect(() => {
        if (!containerRef.current) return;

        const calculateRenderedPanels = () => {
            const scrollX = containerRef.current.scrollLeft;
            const scrollY = containerRef.current.scrollTop;
            const containerWidth = containerRef.current.clientWidth;
            const containerHeight = containerRef.current.clientHeight;

            const container = {
                x: scrollX,
                y: scrollY,
                width: containerWidth,
                height: containerHeight,
            };

            const panelBounds = [];

            for (let y = 0; y < PANEL_COUNT; y++) {
                for (let x = 0; x < PANEL_COUNT; x++) {
                    const bounds = {
                        x: x * CELL_COUNT * CELL_WIDTH,
                        y: y * CELL_COUNT * CELL_HEIGHT,
                        width: CELL_COUNT * CELL_WIDTH,
                        height: CELL_COUNT * CELL_HEIGHT,
                    };

                    panelBounds.push(bounds);
                }
            }

            const newRenderedPanels = new Set<number>();

            for (let i = 0; i < PANEL_COUNT * PANEL_COUNT; i++) {
                const bounds = panelBounds[i];

                const intersects =
                    container.x < bounds.x + bounds.width &&
                    container.x + container.width > bounds.x &&
                    container.y < bounds.y + bounds.height &&
                    container.y + container.height > bounds.y;

                if (intersects) {
                    newRenderedPanels.add(i);
                }
            }

            setRenderedPanels((prevRenderedPanels) => {
                if (
                    prevRenderedPanels.size === newRenderedPanels.size &&
                    [...prevRenderedPanels].every((p) =>
                        newRenderedPanels.has(p),
                    )
                ) {
                    return prevRenderedPanels;
                }
                return newRenderedPanels;
            });
        };

        containerRef.current.addEventListener(
            "scroll",
            calculateRenderedPanels,
        );

        calculateRenderedPanels();

        return () => {
            containerRef.current?.removeEventListener(
                "scroll",
                calculateRenderedPanels,
            );
        };
    }, [containerRef.current]);

    return { renderedPanels };
};

const getPanelRowAndColumn = (panelIndex: number) => {
    const panelRow = Math.floor(panelIndex / PANEL_COUNT);
    const panelCol = panelIndex % PANEL_COUNT;
    return { panelRow, panelCol };
};

const getCellRowAndColumn = (
    cellIndex: number,
    panelRow: number,
    panelCol: number,
) => {
    const cellRow = panelRow * CELL_COUNT + Math.floor(cellIndex / CELL_COUNT);
    const cellCol = panelCol * CELL_COUNT + (cellIndex % CELL_COUNT);

    return { cellRow, cellCol };
};

interface SpreadsheetSpecificProps {
    children: (props: { ri: number; ci: number }) => React.ReactNode;
    selectedRows: Set<number>;
    selectedCols: Set<number>;
}

type SpreadsheetProps = SpreadsheetSpecificProps &
    Omit<ComponentProps<"div">, "children">;

export const SpreadsheetComponent = ({
    children,
    selectedRows,
    selectedCols,
    ...props
}: SpreadsheetProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const { renderedPanels } = useRenderedPanels({ containerRef });

    const ColumnRow = useCallback(() => {
        const data = Array.from(Array(SPREADSHEET_SIZE + 1));

        return data.map((_, itemIndex) =>
            itemIndex === 0 ? (
                <StaticItemSmall key={itemIndex}>{""}</StaticItemSmall>
            ) : (
                <IndicatorItemSmall
                    $selected={selectedRows.has(itemIndex - 1)}
                    key={itemIndex}
                >
                    {itemIndex}
                </IndicatorItemSmall>
            ),
        );
    }, [selectedRows]);

    const RowColumn = useCallback(() => {
        const data = Array.from(Array(SPREADSHEET_SIZE));

        return data.map((_, itemIndex) => (
            <IndicatorItem
                $selected={selectedCols.has(itemIndex)}
                key={itemIndex}
            >
                {SpreadsheetUtils.columnIndexToText(itemIndex)}
            </IndicatorItem>
        ));
    }, [selectedCols]);

    return (
        <Container ref={containerRef} {...props}>
            <Left>
                <ColumnRow />
            </Left>

            <Right>
                <Top>
                    <RowColumn />
                </Top>

                <Bottom>
                    <Content>
                        {SPREADSHEET_PANELS.map((_, panelIndex) => {
                            const panelId = `panel-${panelIndex}`;
                            const shouldRender = renderedPanels.has(panelIndex);

                            if (!shouldRender) {
                                return <Panel id={panelId} key={panelIndex} />;
                            }

                            const { panelRow, panelCol } =
                                getPanelRowAndColumn(panelIndex);

                            return (
                                <Panel id={panelId} key={panelIndex}>
                                    {PANEL_CELLS.map((_, cellIndex) => {
                                        const { cellRow, cellCol } =
                                            getCellRowAndColumn(
                                                cellIndex,
                                                panelRow,
                                                panelCol,
                                            );

                                        return children({
                                            ri: cellRow,
                                            ci: cellCol,
                                        });
                                    })}
                                </Panel>
                            );
                        })}
                    </Content>
                </Bottom>
            </Right>
        </Container>
    );
};

export const SpreadsheetCell = styled.div`
    width: ${CELL_WIDTH}px;
    height: ${CELL_HEIGHT}px;

    font-size: 12px;

    border: 0.1px solid var(--bg-5);
    background-color: var(--bg-1);
`;

const Container = styled.div`
    width: 100%;
    height: 100%;

    overflow: auto;

    display: flex;
    flex-direction: row;

    border: 1px solid var(--bg-5);
    border-top-width: 0.5px;

    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;

    user-select: none;

    background-color: var(--bg-1);
`;

const Left = styled.div`
    display: flex;
    flex-direction: column;

    height: ${1001 * CELL_HEIGHT}px;

    position: sticky;
    left: 0;

    z-index: 10;
`;

const Right = styled.div`
    display: flex;
    flex-direction: column;

    height: ${1001 * CELL_HEIGHT}px;

    z-index: 9;
`;

const Top = styled.div`
    width: ${1000 * CELL_WIDTH}px;
    display: flex;
    flex-direction: row;

    position: sticky;
    top: 0;

    z-index: 2;
`;

const Bottom = styled.div`
    flex: 1;
`;

const Content = styled.div`
    display: grid;
    grid-template-columns: repeat(${PANEL_COUNT}, auto);
`;

const Panel = styled.div`
    width: ${CELL_COUNT * CELL_WIDTH}px;
    height: ${CELL_COUNT * CELL_HEIGHT}px;

    display: grid;
    grid-template-columns: repeat(${CELL_COUNT}, auto);

    background-color: var(--bg-1);
`;

const IndicatorItem = styled(SpreadsheetCell)<{ $selected?: boolean }>`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    background-color: var(--bg-2);

    font-size: 12px;
    font-weight: 600;
    color: var(--text-2);

    ${({ $selected }) =>
        $selected &&
        `
        background-color: var(--bg-4); 
    `};
`;

const StaticItem = styled(IndicatorItem)`
    position: sticky;
    top: 0;
    left: 0;
`;

const IndicatorItemSmall = styled(IndicatorItem)`
    width: ${CELL_HEIGHT}px;
`;

const StaticItemSmall = styled(StaticItem)`
    width: ${CELL_HEIGHT}px;
`;
