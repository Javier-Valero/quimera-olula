import { render } from "@testing-library/react";
import { DragDropContext, Draggable, Droppable } from "./index";

test("Droppable/Draggable (@hello-pangea/dnd) con la API del legacy", () => {
  const errores = vi.spyOn(console, "error");
  const { getAllByTestId } = render(
    <DragDropContext onDragEnd={() => {}}>
      <Droppable droppableId="lista">
        {provided => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            {["a", "b"].map((id, index) => (
              <Draggable key={id} draggableId={id} index={index}>
                {p => <div data-testid="item" ref={p.innerRef} {...p.draggableProps} {...p.dragHandleProps}>{id}</div>}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>,
  );
  const items = getAllByTestId("item");
  expect(items).toHaveLength(2);
  expect(items[0].getAttribute("data-rfd-draggable-id")).toBe("a");
  expect(errores).not.toHaveBeenCalled();
});
