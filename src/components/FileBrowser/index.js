import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import styles from "./index.css";
import uuidv4 from "uuid/v4";

import { getFile, setFile, getLS, setLS } from "../../utils";

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
  }
];


export default function(props) {
	const [isExpanded, setIsExpanded] = useState(true);
	const [files, setFiles] = useState([]);
	const { onFileSelect } = props;

	useEffect(() => {
		let allFiles = getLS("files");
		if (!allFiles) {
			allFiles = initLocalStorage();
		}

		if (allFiles.length === 0) {
			return;
		}

		setFiles(allFiles);

		// Open the first file.
		onFileSelect(allFiles[0].id);
	}, []);

	function handleToggleExpand() {
		setIsExpanded(!isExpanded);
	}

	function createFile(filename) {
		const id = uuidv4();

		// File text.
		setLS(id, initialValue);

		// File meta.
		const curFiles = getLS("files");
		const newFiles = [
			{ id, name: filename, created: Date.now(), modified: Date.now() },
			...curFiles
		];
		setLS("files", newFiles);

		setFiles(newFiles);

		return {
			createdId: id,
			newFiles
		};
	}

	function initLocalStorage() {
		// Don't overwrite existing.
		if (getLS("files")) {
			return getLS("files");
		}

		setLS("files", []);

		const initialFiles = [];
		const { newFiles } = createFile("New Document");

		return newFiles;
	}

	function handleCreateNew(filename) {
		const { newFiles, createdId } = createFile(filename);

		setFiles(newFiles);

		onFileSelect(createdId);
	}

	let containerClass = styles.container;
	containerClass +=
		" " + (isExpanded ? styles.expandOpen : styles.expandClosed);

	return (
		<div className={containerClass}>
			<div className={styles.expand}>
				<button onClick={handleCreateNew.bind(null, "New Document")}>
					Create New
				</button>
				<button onClick={handleToggleExpand}>
					{isExpanded ? "Close" : "Open"}
				</button>
			</div>
			<ul className={styles.browser}>
				{files.map(({ id, name }) => {
					return <li className={styles.file} onClick={onFileSelect.bind(null, id)} key={id}>{name}</li>;
				})}
			</ul>
		</div>
	);
}
