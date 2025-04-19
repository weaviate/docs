import React, { isValidElement, useRef, useEffect } from "react";
import useBrokenLinks from "@docusaurus/useBrokenLinks";
import { useHistory } from "@docusaurus/router";
// Assuming you have a CSS module setup for styles
// If not, you might need to adjust className usage
import styles from "./styles.module.scss";

// ReactNode equivalent of HTMLElement#innerText
function getRowName(node) {
  let curNode = node;
  while (isValidElement(curNode)) {
    [curNode] = React.Children.toArray(curNode.props.children);
  }
  if (typeof curNode !== "string") {
    throw new Error(
      `Could not extract APITable row name from JSX tree:\n${JSON.stringify(
        node,
        null,
        2
      )}`
    );
  }
  // No need for 'as string' assertion in JS
  return curNode;
}

function APITableRow({ name, children }, ref) {
  const entryName = getRowName(children);
  const id = name ? `${name}-${entryName}` : entryName;
  const anchor = `#${id}`;
  const history = useHistory();
  useBrokenLinks().collectAnchor(id);

  return (
    <tr
      id={id}
      tabIndex={0}
      // Assign ref only if it's the highlighted row based on hash
      ref={history.location.hash === anchor ? ref : undefined}
      onClick={(e) => {
        // No need for 'as HTMLElement' assertion in JS
        const isTDClick = e.target.tagName.toUpperCase() === "TD";
        const hasSelectedText = !!window.getSelection()?.toString();

        const shouldNavigate = isTDClick && !hasSelectedText;
        if (shouldNavigate) {
          history.push(anchor);
        }
      }}
      onKeyDown={(e) => {
        // No type needed for 'e'
        if (e.key === "Enter") {
          history.push(anchor);
        }
      }}
    >
      {/* Render the children of the original <tr> passed in */}
      {children.props.children}
    </tr>
  );
}

// Forward the ref to the APITableRow component
const APITableRowComp = React.forwardRef(APITableRow);

/*
 * Note: this is not a quite robust component since it makes a lot of
 * assumptions about how the children looks; however, those assumptions
 * should be generally correct in the MDX context.
 */
export default function APITable({ children, name }) {
  // Remove type annotations for props
  // Basic validation remains useful
  if (children.type !== "table") {
    throw new Error(
      "Bad usage of APITable component.\nIt is probably that your Markdown table is malformed.\nMake sure to double-check you have the appropriate number of columns for each table row."
    );
  }

  // Destructuring assumes the children are [thead, tbody]
  // No need for 'as [...]' assertion in JS
  const [thead, tbody] = React.Children.toArray(children.props.children);

  // Remove generic type <HTMLTableRowElement> from useRef
  const highlightedRow = useRef(null);

  useEffect(() => {
    // Optional chaining is good practice
    highlightedRow.current?.focus();
  }, [highlightedRow]); // Dependency array remains the same

  const rows = React.Children.map(
    tbody.props.children,
    // Remove type annotation for 'row'
    (row) => (
      <APITableRowComp name={name} ref={highlightedRow}>
        {row}
      </APITableRowComp>
    )
  );

  return (
    <table className={styles.apiTable}>
      {thead}
      <tbody>{rows}</tbody>
    </table>
  );
}
