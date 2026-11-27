import { render } from "@testing-library/react";
import { clsx, InfiniteScroll, NumberFormat } from "./index";

test("InfiniteScroll 7 renderiza la lista con la API del legacy", () => {
  const errores = vi.spyOn(console, "error");
  const { getAllByTestId, queryByText } = render(
    <InfiniteScroll dataLength={2} next={() => {}} hasMore loader={<p>Cargando</p>} scrollableTarget="contenedor">
      <div data-testid="item">a</div>
      <div data-testid="item">b</div>
    </InfiniteScroll>,
  );
  expect(getAllByTestId("item")).toHaveLength(2);
  // Como en la v5: con elementos, el loader solo aparece al disparar `next`
  expect(queryByText("Cargando")).toBeNull();
  expect(errores).not.toHaveBeenCalled();
});

test("clsx 2 y NumberFormat siguen exportados igual", () => {
  expect(clsx("a", { b: true, c: false })).toBe("a b");
  const { container } = render(<NumberFormat value={1234.5} thousandSeparator="." decimalSeparator="," displayType="text" />);
  expect(container.textContent).toBe("1.234,5");
});
