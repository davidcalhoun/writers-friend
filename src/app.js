import React, { useCallback, useMemo, useState, useEffect } from "react";
import isHotkey from "is-hotkey";
import { Editable, withReact, useSlate, Slate } from "slate-react";
import { Editor, Transforms, createEditor } from "slate";
import { withHistory } from "slate-history";

import FormatBoldIcon from "@material-ui/icons/FormatBold";
import FormatItalicIcon from "@material-ui/icons/FormatItalic";
import FormatUnderlinedIcon from "@material-ui/icons/FormatUnderlined";
import CodeIcon from "@material-ui/icons/Code";
import LooksOneIcon from "@material-ui/icons/LooksOne";
import LooksTwoIcon from "@material-ui/icons/LooksTwo";
import FormatQuoteIcon from "@material-ui/icons/FormatQuote";
import FormatListNumberedIcon from "@material-ui/icons/FormatListNumbered";
import FormatListBulletedIcon from "@material-ui/icons/FormatListBulleted";
import FullscreenIcon from "@material-ui/icons/Fullscreen";
import FullscreenExitIcon from "@material-ui/icons/FullscreenExit";
import SpellcheckIcon from "@material-ui/icons/Spellcheck";

import Tooltip from '@material-ui/core/Tooltip';

import { Button, Icon, Toolbar, LastSaved } from "./components";

import { debounce } from "./utils";
import styles from "./app.css";

const HOTKEYS = {
  "mod+b": "bold",
  "mod+i": "italic",
  "mod+u": "underline",
  "mod+`": "code"
};

const LIST_TYPES = ["numbered-list", "bulleted-list"];

const getFromLocalStorage = docName => {
  const val = localStorage.getItem(docName);

  let parsedVal = null;

  if (val === null) return parsedVal;

  try {
    parsedVal = JSON.parse(val);
  } catch (e) {
    console.error(e);
  }

  return parsedVal;
};

const setLocalStorage = (docName, value) => {
  const stringifiedVal = JSON.stringify(value);

  localStorage.setItem(docName, stringifiedVal);

  const lastSavedTimeMS = Date.now();

  return lastSavedTimeMS;
};

const debouncedSetLocalStorage = debounce(setLocalStorage, 3000);

function toggleFullScreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  }
}

const RichTextExample = () => {
  const docName = "foo";
  const initialValueFromLocalStorage = getFromLocalStorage(docName);
  const [value, setValue] = useState(
    initialValueFromLocalStorage || initialValue
  );
  const [spellcheckActive, setSpellcheckActive] = useState(false);
  const [lastSavedTimeMS, setLastSavedMS] = useState(0);
  const renderElement = useCallback(props => <Element {...props} />, []);
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const editor = useMemo(() => withHistory(withReact(createEditor())), []);

  function init() {
    document.documentElement.classList.remove("loading");
  }
  useEffect(init, []);

  function handleSpellcheckClick(event) {
    setSpellcheckActive(!spellcheckActive);
  }

  async function handleChange(value) {
    // Update state immediately.
    setValue(value);

    const timeMS = await debouncedSetLocalStorage(docName, value);
    setLastSavedMS(timeMS);
  }

  // Note: need to add spellCheck to container because of a Slate hack/workaround with FF.

  return (
    <div className={styles.container} spellCheck={ spellcheckActive }>
      <Slate editor={editor} value={value} onChange={handleChange}>
        <Toolbar>
          <MarkButton format="bold" icon={FormatBoldIcon} />
          <MarkButton format="italic" icon={FormatItalicIcon} />
          <MarkButton format="underline" icon={FormatUnderlinedIcon} />
          <MarkButton format="code" icon={CodeIcon} />
          <BlockButton format="heading-one" icon={LooksOneIcon} />
          <BlockButton format="heading-two" icon={LooksTwoIcon} />
          <BlockButton format="block-quote" icon={FormatQuoteIcon} />
          <BlockButton format="numbered-list" icon={FormatListNumberedIcon} />
          <BlockButton format="bulleted-list" icon={FormatListBulletedIcon} />
          <Tooltip title="Spellcheck" enterDelay={500}>
            <Button
              onMouseDown={handleSpellcheckClick}
              active={spellcheckActive}
            >
              <SpellcheckIcon />
            </Button>
          </Tooltip>
          <Tooltip title="Toggle fullscreen mode" enterDelay={500}>
            <Button
              onMouseDown={toggleFullScreen}
            >
              <FullscreenIcon />
            </Button>
          </Tooltip>
        </Toolbar>
        <Editable
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          placeholder="Enter some rich text…"
          spellCheck={ spellcheckActive }
          autoFocus
          onKeyDown={event => {
            for (const hotkey in HOTKEYS) {
              if (isHotkey(hotkey, event)) {
                event.preventDefault();
                const mark = HOTKEYS[hotkey];
                toggleMark(editor, mark);
              }
            }
          }}
        />
        <LastSaved time={lastSavedTimeMS} />
      </Slate>
    </div>
  );
};

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(editor, format);
  const isList = LIST_TYPES.includes(format);

  Transforms.unwrapNodes(editor, {
    match: n => LIST_TYPES.includes(n.type),
    split: true
  });

  Transforms.setNodes(editor, {
    type: isActive ? "paragraph" : isList ? "list-item" : format
  });

  if (!isActive && isList) {
    const block = { type: format, children: [] };
    Transforms.wrapNodes(editor, block);
  }
};

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format);

  if (isActive) {
    Editor.removeMark(editor, format);
  } else {
    Editor.addMark(editor, format, true);
  }
};

const isBlockActive = (editor, format) => {
  const [match] = Editor.nodes(editor, {
    match: n => n.type === format
  });

  return !!match;
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor);
  return marks ? marks[format] === true : false;
};

const Element = ({ attributes, children, element }) => {
  switch (element.type) {
    case "block-quote":
      return <blockquote {...attributes}>{children}</blockquote>;
    case "bulleted-list":
      return <ul {...attributes}>{children}</ul>;
    case "heading-one":
      return <h1 {...attributes}>{children}</h1>;
    case "heading-two":
      return <h2 {...attributes}>{children}</h2>;
    case "list-item":
      return <li {...attributes}>{children}</li>;
    case "numbered-list":
      return <ol {...attributes}>{children}</ol>;
    default:
      return <p {...attributes}>{children}</p>;
  }
};

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return <span {...attributes}>{children}</span>;
};

const BlockButton = ({ format, icon: IconElement }) => {
  const editor = useSlate();
  return (
    <Button
      active={isBlockActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault();
        toggleBlock(editor, format);
      }}
    >
      <IconElement />
    </Button>
  );
};

const MarkButton = ({ format, icon: IconElement }) => {
  const editor = useSlate();
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault();
        toggleMark(editor, format);
      }}
    >
      <IconElement />
    </Button>
  );
};

const initialValue = [
  {
    type: "paragraph",
    children: [
      { text: "This is editable " },
      { text: "rich", bold: true },
      { text: " text, " },
      { text: "much", italic: true },
      { text: " better than a " },
      { text: "<textarea>", code: true },
      { text: "!" }
    ]
  },
  {
    type: "paragraph",
    children: [
      {
        text:
          "Since it's rich text, you can do things like turn a selection of text "
      },
      { text: "bold", bold: true },
      {
        text:
          ", or add a semantically rendered block quote in the middle of the page, like this:"
      }
    ]
  },
  {
    type: "block-quote",
    children: [{ text: "A wise quote." }]
  },
  {
    type: "paragraph",
    children: [{ text: "Try it out for yourself!" }]
  }
];

export default RichTextExample;
