//TODO: Add icons
import type {
	ContentColumns,
	Content,
	Column,
	TDocumentDefinitions,
	TFontDictionary,
} from 'pdfmake/interfaces';
import type { Resume } from '../models/Resume';
import * as pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
import type { Introduction } from '../models/Introduction';
import { getInfoFromUrl } from './urlService';
const enum IntroductionColumnType {
	email,
	link,
	text,
}
const isContentColumns = (
	content: Content | undefined
): content is ContentColumns => {
	return Boolean(content);
};
function createIntroductionColumn(
	link: string,
	introductionColumnType: IntroductionColumnType
): Column {
	const urlInfo = getInfoFromUrl(link);
	if (introductionColumnType == IntroductionColumnType.link) {
		return {
			text: urlInfo,
			link: link,
			style: ['introductionColumn', 'link'],
		};
	} else if (introductionColumnType == IntroductionColumnType.email) {
		return {
			text: urlInfo,
			link: `mailto:${link}`,
			style: ['introductionColumn', 'link'],
		};
	} else {
		return { text: urlInfo, style: 'introductionColumn' };
	}
}
function addIntroductionColumn(
	result: Content[],
	text: string,
	count: number,
	introductionColumnType: IntroductionColumnType
) {
	const column = createIntroductionColumn(text, introductionColumnType);
	if (count % 3 == 0) {
		result.push({ columns: [column] });
	} else {
		const lastColumns = result.pop();
		if (isContentColumns(lastColumns)) {
			const columns = lastColumns as ContentColumns;
			result.push({
				columns: [...columns.columns, column],
			});
		}
	}
}
function createIntroductionColumns(introduction: Introduction) {
	const result = [] as Content[];
	let count = 0;
	if (introduction.location) {
		addIntroductionColumn(
			result,
			introduction.location,
			count++,
			IntroductionColumnType.text
		);
	}
	if (introduction.email) {
		addIntroductionColumn(
			result,
			introduction.email,
			count++,
			IntroductionColumnType.email
		);
	}
	if (introduction.website) {
		addIntroductionColumn(
			result,
			introduction.website,
			count++,
			IntroductionColumnType.link
		);
	}
	for (let index = 0; index < introduction.socialAccounts.length; index++) {
		const element = introduction.socialAccounts[index];
		addIntroductionColumn(
			result,
			element.link,
			count++,
			IntroductionColumnType.link
		);
	}
	return result;
}
export function createResumePDFDefinition(
	resume: Resume
): TDocumentDefinitions {
	return {
		content: [
			{ text: resume.introduction.name, style: 'h1' },
			{ text: resume.introduction.profetion, style: 'h2' },
			...createIntroductionColumns(resume.introduction),
		],
		styles: {
			h1: {
				fontSize: 28,
				bold: true,
			},
			h2: {
				marginTop: 15,
				fontSize: 23,
				bold: true,
			},
			introductionColumn: {
				marginTop: 10,
				fontSize: 10,
			},
			link: {
				color: 'blue',
			},
		},
	};
}
export function savePDF(resumeDefinition: TDocumentDefinitions) {
	const fonts: TFontDictionary = {
		Fontello: {
			normal: 'public/fonts/fontello.ttf',
			bold: 'public/fonts/fontello.ttf',
			italics: 'public/fonts/fontello.ttf',
			bolditalics: 'public/fonts/fontello.ttf',
		},
		Roboto: {
			normal: 'Roboto-Regular.ttf',
			bold: 'Roboto-Medium.ttf',
			italics: 'Roboto-Italic.ttf',
			bolditalics: 'Roboto-Italic.ttf',
		},
		FontAwesome: {
			normal: 'FontAwesome.ttf',
			bold: 'FontAwesome.ttf',
			italics: 'FontAwesome.ttf',
			bolditalics: 'FontAwesome.ttf',
		},
	};
	const vsf = pdfFonts.pdfMake.vfs;
	pdfMake.createPdf(resumeDefinition, undefined, fonts, vsf).open();
}