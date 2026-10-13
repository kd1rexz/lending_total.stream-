import { pathToFileURL } from 'node:url';
import { loadValidatedContent } from '../src/lib/content-source.mjs';

export async function validateRelease(options) {
  return loadValidatedContent(options);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const { build, source } = await validateRelease();
    console.log(
      build.isPreview
        ? `Preview content valid: ${source.services.length} draft services; ${source.cases.length} cases. Publication is disabled.`
        : 'Production content valid: contacts, approvals, published cases and asset rights are present.',
    );
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
