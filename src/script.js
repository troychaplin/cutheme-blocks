wp.domReady(() => {
    // Dump block styles to the console - https://soderlind.no/hide-block-styles-in-gutenberg/
	// wp.blocks.getBlockTypes().forEach((block) => {
	// 	if (_.isArray(block['styles'])) {
	// 		console.log(block.name, _.pluck(block['styles'], 'name'));
	// 	}
	// });

	const allowedCoreBlocks = [
        'core/block',
		'core/button',
		'core/buttons',
		'core/column',
		'core/columns',
		'core/cover',
		'core/embed',
		'core/gallery',
		'core/heading',
		'core/image',
		'core/latest-posts',
		'core/list',
		'core/list-item',
		'core/media-text',
		'core/paragraph',
		'core/quote',
		'core/table',
		// All below are needed for query loop
		// 'core/query',
		// 'core/post-title',
		// 'core/post-date',
		// 'core/post-template',
		// 'core/query-pagination',
		// 'core/query-pagination-previous',
		// 'core/query-pagination-numbers',
		// 'core/query-pagination-next',
		// 'core/query-no-results',
		// 'core/missing',
	];

	const allowedCustomBlocks = [
		'starter-block/feature-card',
		'starter-block/hero-image'
	];

    // TODO: Wrap in check if current user is admin
	const allowedAdminBlocks = [
		'core/html',
		'core/shortcode'
	];

	const allowedPluginBlocks = [
		// 'gravityforms/form'
	];

	const allowedBlocks = allowedCoreBlocks.concat(allowedCustomBlocks, allowedAdminBlocks, allowedPluginBlocks);

	const allowedEmbedBlocks = [
		'instagram',
        'soundcloud',
		'twitter',
		'youtube',
		'vimeo'
	];

	// Set allowed blocks
	wp.blocks.getBlockTypes().forEach(function (coreBlocks) {
		if (allowedBlocks.indexOf(coreBlocks.name) === -1) {
			wp.blocks.unregisterBlockType(coreBlocks.name);
		}
	});

	// Set allowed embed blocks - https://wordpress.stackexchange.com/questions/393243/limit-gutenberg-blocks-available-to-users-to-choose-from
	wp.blocks.getBlockType('core/embed').variations.forEach(function (blockVariation) {
		if (allowedEmbedBlocks.indexOf(blockVariation.name) === -1) {
			wp.blocks.unregisterBlockVariation('core/embed', blockVariation.name);
		}
	});

	// Remove block styles - https://stackoverflow.com/questions/71637137/remove-property-from-wordpress-core-gutenberg-block
	wp.blocks.unregisterBlockStyle('core/image', 'default');
	wp.blocks.unregisterBlockStyle('core/image', 'rounded');
	wp.blocks.unregisterBlockStyle('core/quote', 'default');
	wp.blocks.unregisterBlockStyle('core/quote', 'plain');
	wp.blocks.unregisterBlockStyle('core/table', 'regular');
	wp.blocks.unregisterBlockStyle('core/table', 'stripes');
});

//
// Remove other editor panels
wp.data.dispatch('core/edit-post').removeEditorPanel('discussion-panel');

//
// Remove core block elements via the block support API
// @see https://css-tricks.com/a-crash-course-in-wordpress-block-filters/
// @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-supports/#typography
// @see https://javascriptforwp.com/extending-wordpress-blocks/

const { addFilter } = wp.hooks;
const { assign, merge } = lodash;

function modifyCoreBlocks(settings, name) {
	// Log block options before the return
	// console.log({ settings, name });

    const bulkModifyBlocks = [
        "core/paragraph",
        "core/list",
        "core/quote",
    ];
	
	// Remove color support from blocks
	if (bulkModifyBlocks.includes(name)) {
        return assign({}, settings, {
            supports: merge(settings.supports, {
                color: false,
                typography: false,
            })
        });
	}
	
    // Remove color support from blocks
	if (name === 'core/button') {
        return assign({}, settings, {
            supports: merge(settings.supports, {
                color: false,
            })
        });
	}
	
    // Remove color support from blocks
	if (name === 'core/columns') {
        return assign({}, settings, {
            category: "text",
            supports: merge(settings.supports, {
                align: false,
                color: false,
            })
        });
	}
	
	// Core heading block modifications
	// TODO - removing headings from attr and supports alone doesn't do the trick
	if (name === "core/heading") {
        return assign({}, settings, {
            attributes: merge(settings.attributes, {
                content: {
                    selector: "h2,h3,h4",
                },
            }),
            supports: merge(settings.supports, {
                color: false,
                __experimentalSelector: "h2,h3,h4"
            })
        });
	}
	
    // Remove color support from blocks
	if (name === 'core/table') {
        console.log({ settings, name });
        return assign({}, settings, {
            supports: merge(settings.supports, {
                color: false,
            })
        });
	}

	// Core latest posts block modifications - https://wp-qa.com/changing-the-category-for-existing-gutenberg-blocks
	// if (name === "core/latest-posts") {
	// 	return assign({}, settings, {
	// 		category: "listings",
	// 		attributes:{
	// 			columns: {
	// 				default: 3
	// 			},
	// 			displayFeaturedImage: {
	// 				default: true
	// 			},
	// 			displayPostDate: {
	// 				default: true
	// 			},
	// 			featuredImageSizeSlug: {
	// 				default: 'thumbnail'
	// 			},
	// 			postLayout: {
	// 				default: 'grid'
	// 			},
	// 			postsToShow: {
	// 				default: 6
	// 			}
	// 		}
	// 	});
	// }

	return settings;
}

addFilter(
	'blocks.registerBlockType',
	'cuBlockModifications',
	modifyCoreBlocks,
);