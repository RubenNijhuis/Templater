// Node
import fs from "fs";
import path from "path";

// Prompt utils
import { askListOfQuestions } from "./question.js";

// Template handler
import TemplateFile from "./TemplateFile.js";

// Types
import { AnswerList, OptionsConfig } from "./types.js";

////////////////////////////////////////////////////////////////////////////////

/**
 * Generates template file classes from the options file
 *
 * @param templateDirectory
 * @param options
 * @returns
 */
export const getFilesFromTemplateOptions = async (
	templateDirectory: string,
	options: OptionsConfig
): Promise<TemplateFile[]> => {
	try {
		let templateFiles: TemplateFile[] = [];

		let globalAnswered: AnswerList | null = null;

		// If there are questions in the general
		if (options.global?.questions?.length) {
			globalAnswered = await askListOfQuestions(options.global.questions);
		}

		for (const templateConfig of options.files) {
			const filePath = path.join(
				templateDirectory,
				templateConfig.template
            );
            
			const template = new TemplateFile({
				filePath,
				templateConfig,
			});

			if (globalAnswered) {
				template.addGlobalAnswers(globalAnswered);
			}

			if (options.global?.config) {
				template.addGlobalConfig(options.global.config);
			}

			templateFiles.push(template);
		}

		return templateFiles;
	} catch (err) {
		throw err;
	}
};

/**
 *
 * @param selectedTemplatePath
 * @returns
 */
export const getOptionsConfig = async (
	selectedTemplatePath: string
): Promise<OptionsConfig> => {
	try {
		const templateOptionsPath = path.join(
			selectedTemplatePath,
			"options.json"
		);

		let optionsContent = fs.readFileSync(templateOptionsPath, {
			encoding: "utf-8",
		});

		const templateOptions: OptionsConfig = JSON.parse(optionsContent);

		return templateOptions;
	} catch (err) {
		throw err;
	}
};

export const isVariableName = (
	str: string
): { name: string; isVariable: boolean } => {
	// Check if variable is formatted like {{name}}
	const trimmed = str.replace(/\s/g, "");
	const startsWith = trimmed.startsWith("{{");
	const endsWith = trimmed.endsWith("}}");

	return {
		name: str.slice(2, -2),
		isVariable: startsWith && endsWith,
	};
};
