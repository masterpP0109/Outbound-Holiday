(function ($) {
    'use strict';

    function escapeHtml(str) {
        return String(str || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    function initInboxPreview() {
        var $sender = $('#outbound-nl-sender-name');
        var $subject = $('#outbound-nl-subject');
        var $preheader = $('#outbound-nl-preheader');
        var $subjCount = $('#outbound-nl-subject-count');
        var $preCount = $('#outbound-nl-preheader-count');

        function update() {
            var sName = ($sender.val() || 'Outbound Holidays').trim();
            var subj = ($subject.val() || '(No subject yet)').trim();
            var pre = ($preheader.val() || 'Optional inbox preview summary...').trim();

            $('#outbound-inbox-sender').text(sName);
            $('#outbound-inbox-subject').text(subj);
            $('#outbound-inbox-preheader').text(pre);

            if ($subjCount.length) {
                var sl = ($subject.val() || '').length;
                $subjCount.text(sl + ' chars' + (sl > 60 ? ' (long on mobile)' : ' (ideal <= 60)'));
            }
            if ($preCount.length) {
                var pl = ($preheader.val() || '').length;
                $preCount.text(pl + ' chars' + (pl > 90 ? ' (may truncate)' : ' (ideal 40-90)'));
            }
        }

        $sender.add($subject).add($preheader).on('input', update);
        update();
    }

    function initMediaPickers() {
        $(document).on('click', '.outbound-nl-pick-media', function (e) {
            e.preventDefault();
            var $btn = $(this);
            var targetUrl = $btn.data('target-url');
            var targetId = $btn.data('target-id');
            var targetAlt = $btn.data('target-alt');
            var targetPreview = $btn.data('target-preview');

            if (typeof wp === 'undefined' || !wp.media) {
                return;
            }

            var frame = wp.media({
                title: 'Select Email Image',
                button: { text: 'Use Image' },
                multiple: false,
                library: { type: 'image' }
            });

            frame.on('select', function () {
                var attachment = frame.state().get('selection').first().toJSON();
                if (targetUrl) {
                    $(targetUrl).val(attachment.url || '').trigger('change');
                }
                if (targetId) {
                    $(targetId).val(attachment.id || '');
                }
                if (targetAlt && !$(targetAlt).val()) {
                    $(targetAlt).val(attachment.alt || attachment.title || '');
                }
                if (targetPreview) {
                    $(targetPreview).html('<img src="' + escapeHtml(attachment.url) + '" alt="" style="max-width:100%;max-height:180px;border-radius:8px;border:1px solid #d5e0e5;display:block;" />');
                }
                if (typeof window.outboundSyncBlocksToJson === 'function') {
                    window.outboundSyncBlocksToJson();
                }
            });

            frame.open();
        });

        $(document).on('click', '.outbound-nl-clear-media', function (e) {
            e.preventDefault();
            var $btn = $(this);
            var emptyLabel = $btn.data('empty-label') || 'No image selected';
            if ($btn.data('target-url')) {
                $($btn.data('target-url')).val('').trigger('change');
            }
            if ($btn.data('target-id')) {
                $($btn.data('target-id')).val('');
            }
            if ($btn.data('target-preview')) {
                $($btn.data('target-preview')).html('<div class="outbound-nl-empty-img">' + escapeHtml(emptyLabel) + '</div>');
            }
            if (typeof window.outboundSyncBlocksToJson === 'function') {
                window.outboundSyncBlocksToJson();
            }
        });
    }

    function initTemplateSelector() {
        $(document).on('change', 'input[name="template_id"]', function () {
            $('.outbound-nl-template-card').removeClass('is-selected');
            $(this).closest('.outbound-nl-template-card').addClass('is-selected');
        });
        $(document).on('change', 'input[name="audience_segment"]', function () {
            $('.outbound-nl-audience-card').removeClass('is-selected');
            $(this).closest('.outbound-nl-audience-card').addClass('is-selected');
            var label = $(this).data('label') || '';
            var count = $(this).data('count');
            $('#outbound-confirm-audience').text(label + ' (' + count + ' confirmed subscribers)');
        });
    }

    function initBlockEditor() {
        var $container = $('#outbound-nl-blocks-list');
        var $jsonInput = $('#outbound-nl-blocks-json');
        if (!$container.length || !$jsonInput.length) {
            return;
        }

        var blocks = [];
        try {
            var parsed = JSON.parse($jsonInput.val() || '[]');
            if (Array.isArray(parsed)) {
                blocks = parsed;
            }
        } catch (err) {
            blocks = [];
        }

        function sync() {
            $jsonInput.val(JSON.stringify(blocks));
        }
        window.outboundSyncBlocksToJson = sync;

        function defaultBlock(type) {
            switch (type) {
                case 'heading':
                    return { type: 'heading', level: 'h2', text: 'Victoria Falls Seasonal Highlight' };
                case 'list':
                    return { type: 'list', items: ['Curated lodge stays in Victoria Falls', 'Private sunset Zambezi river cruise', 'Dedicated local travel concierge'] };
                case 'image':
                    return { type: 'image', url: '', alt: '', caption: '', attachmentId: 0 };
                case 'button':
                    return { type: 'button', label: 'Explore Victoria Falls', url: 'https://outboundholiday.com/', color: '#0B5E8E' };
                case 'columns':
                    return {
                        type: 'columns',
                        leftTitle: 'Zambezi River Cruises',
                        leftBody: 'Golden-hour boat cruises with curated refreshments and wildlife sightings.',
                        leftImageUrl: '',
                        rightTitle: 'Chobe & Hwange Safaris',
                        rightBody: 'Seamless day trips and multi-night guided safari extensions.',
                        rightImageUrl: ''
                    };
                case 'divider':
                    return { type: 'divider', style: 'line' };
                default:
                    return { type: 'paragraph', text: 'Write your message here. Use **bold**, *italic*, or [link text](https://outboundholiday.com/).' };
            }
        }

        function renderBlocks() {
            $container.empty();
            if (!blocks.length) {
                $container.html('<div class="outbound-nl-empty-blocks">No content blocks yet. Add a block or insert a Victoria Falls snippet below.</div>');
                sync();
                return;
            }

            blocks.forEach(function (blk, idx) {
                var $card = $('<div class="outbound-nl-block-card" data-idx="' + idx + '"></div>');
                var typeLabels = {
                    heading: 'Heading',
                    paragraph: 'Paragraph',
                    list: 'Bullet List',
                    image: 'Image',
                    button: 'CTA Button',
                    columns: '2-Column Feature',
                    divider: 'Divider / Spacer'
                };
                var header = '<div class="outbound-nl-block-head">' +
                    '<span class="outbound-nl-block-type">' + escapeHtml(typeLabels[blk.type] || blk.type) + '</span>' +
                    '<div class="outbound-nl-block-actions">' +
                    '<button type="button" class="button button-small outbound-blk-up" ' + (idx === 0 ? 'disabled' : '') + '>Up</button> ' +
                    '<button type="button" class="button button-small outbound-blk-down" ' + (idx === blocks.length - 1 ? 'disabled' : '') + '>Down</button> ' +
                    '<button type="button" class="button button-small button-link-delete outbound-blk-remove">Remove</button>' +
                    '</div></div>';

                var body = '<div class="outbound-nl-block-body">';
                if (blk.type === 'heading') {
                    body += '<div class="outbound-nl-row-inline">' +
                        '<select class="outbound-blk-field" data-key="level" style="width:110px;">' +
                        '<option value="h2"' + (blk.level !== 'h3' ? ' selected' : '') + '>Heading H2</option>' +
                        '<option value="h3"' + (blk.level === 'h3' ? ' selected' : '') + '>Subheading H3</option>' +
                        '</select>' +
                        '<input type="text" class="regular-text outbound-blk-field" data-key="text" value="' + escapeHtml(blk.text) + '" placeholder="Heading text" style="flex:1;" />' +
                        '</div>';
                } else if (blk.type === 'paragraph') {
                    body += '<textarea rows="4" class="large-text outbound-blk-field" data-key="text" placeholder="Paragraph text... Supports **bold**, *italic*, and [label](https://url)">' + escapeHtml(blk.text) + '</textarea>';
                } else if (blk.type === 'list') {
                    var lines = Array.isArray(blk.items) ? blk.items.join('\n') : '';
                    body += '<label class="description">One bullet item per line:</label>' +
                        '<textarea rows="4" class="large-text outbound-blk-list">' + escapeHtml(lines) + '</textarea>';
                } else if (blk.type === 'image') {
                    var uid = 'outbound-blk-img-' + idx;
                    var previewHtml = blk.url
                        ? '<img src="' + escapeHtml(blk.url) + '" alt="" style="max-width:100%;max-height:160px;border-radius:8px;border:1px solid #d5e0e5;display:block;" />'
                        : '<div class="outbound-nl-empty-img">No image selected</div>';
                    body += '<input type="hidden" id="' + uid + '-url" class="outbound-blk-field" data-key="url" value="' + escapeHtml(blk.url) + '" />' +
                        '<input type="hidden" id="' + uid + '-id" class="outbound-blk-field" data-key="attachmentId" value="' + escapeHtml(blk.attachmentId || 0) + '" />' +
                        '<div class="outbound-nl-cols-grid" style="align-items:center;">' +
                        '<div>' +
                        '<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:8px;">' +
                        '<button type="button" class="button button-primary outbound-nl-pick-media" data-target-url="#' + uid + '-url" data-target-alt="#' + uid + '-alt" data-target-id="#' + uid + '-id" data-target-preview="#' + uid + '-preview">Upload / Choose from Gallery</button>' +
                        '<button type="button" class="button button-link-delete outbound-nl-clear-media" data-target-url="#' + uid + '-url" data-target-id="#' + uid + '-id" data-target-preview="#' + uid + '-preview" data-empty-label="No image selected">Remove</button>' +
                        '</div>' +
                        '<input type="text" id="' + uid + '-alt" class="regular-text outbound-blk-field" data-key="alt" value="' + escapeHtml(blk.alt) + '" placeholder="Short photo description (accessibility)" style="width:100%;margin-bottom:6px;" />' +
                        '<input type="text" class="regular-text outbound-blk-field" data-key="caption" value="' + escapeHtml(blk.caption) + '" placeholder="Optional caption under photo" style="width:100%;" />' +
                        '</div>' +
                        '<div id="' + uid + '-preview">' + previewHtml + '</div>' +
                        '</div>';
                } else if (blk.type === 'button') {
                    body += '<div class="outbound-nl-row-inline">' +
                        '<input type="text" class="regular-text outbound-blk-field" data-key="label" value="' + escapeHtml(blk.label) + '" placeholder="Button label" style="flex:1;" />' +
                        '<input type="url" class="regular-text outbound-blk-field" data-key="url" value="' + escapeHtml(blk.url) + '" placeholder="https://..." style="flex:1.4;" />' +
                        '<select class="outbound-blk-field" data-key="color">' +
                        '<option value="#0B5E8E"' + (blk.color === '#0B5E8E' ? ' selected' : '') + '>Zambezi Blue (#0B5E8E)</option>' +
                        '<option value="#3F6B3C"' + (blk.color === '#3F6B3C' ? ' selected' : '') + '>Safari Green (#3F6B3C)</option>' +
                        '<option value="#0D2833"' + (blk.color === '#0D2833' ? ' selected' : '') + '>Deep River (#0D2833)</option>' +
                        '<option value="#D97706"' + (blk.color === '#D97706' ? ' selected' : '') + '>Sunset Amber (#D97706)</option>' +
                        '</select>' +
                        '</div>';
                } else if (blk.type === 'columns') {
                    var colUid = 'outbound-blk-col-' + idx;
                    var leftPreview = blk.leftImageUrl
                        ? '<img src="' + escapeHtml(blk.leftImageUrl) + '" alt="" style="max-width:100%;max-height:120px;border-radius:6px;border:1px solid #d5e0e5;display:block;margin-top:6px;" />'
                        : '<div class="outbound-nl-empty-img" style="margin-top:6px;padding:10px;">No left photo</div>';
                    var rightPreview = blk.rightImageUrl
                        ? '<img src="' + escapeHtml(blk.rightImageUrl) + '" alt="" style="max-width:100%;max-height:120px;border-radius:6px;border:1px solid #d5e0e5;display:block;margin-top:6px;" />'
                        : '<div class="outbound-nl-empty-img" style="margin-top:6px;padding:10px;">No right photo</div>';
                    body += '<div class="outbound-nl-cols-grid">' +
                        '<div><strong>Left Column</strong>' +
                        '<input type="text" class="regular-text outbound-blk-field" data-key="leftTitle" value="' + escapeHtml(blk.leftTitle) + '" placeholder="Left heading" style="width:100%;margin:4px 0;" />' +
                        '<textarea rows="3" class="large-text outbound-blk-field" data-key="leftBody" placeholder="Left description">' + escapeHtml(blk.leftBody) + '</textarea>' +
                        '<input type="hidden" id="' + colUid + '-left-url" class="outbound-blk-field" data-key="leftImageUrl" value="' + escapeHtml(blk.leftImageUrl) + '" />' +
                        '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;">' +
                        '<button type="button" class="button outbound-nl-pick-media" data-target-url="#' + colUid + '-left-url" data-target-preview="#' + colUid + '-left-preview">Upload / Choose Photo</button>' +
                        '<button type="button" class="button button-link-delete outbound-nl-clear-media" data-target-url="#' + colUid + '-left-url" data-target-preview="#' + colUid + '-left-preview" data-empty-label="No left photo">Remove</button>' +
                        '</div>' +
                        '<div id="' + colUid + '-left-preview">' + leftPreview + '</div>' +
                        '</div>' +
                        '<div><strong>Right Column</strong>' +
                        '<input type="text" class="regular-text outbound-blk-field" data-key="rightTitle" value="' + escapeHtml(blk.rightTitle) + '" placeholder="Right heading" style="width:100%;margin:4px 0;" />' +
                        '<textarea rows="3" class="large-text outbound-blk-field" data-key="rightBody" placeholder="Right description">' + escapeHtml(blk.rightBody) + '</textarea>' +
                        '<input type="hidden" id="' + colUid + '-right-url" class="outbound-blk-field" data-key="rightImageUrl" value="' + escapeHtml(blk.rightImageUrl) + '" />' +
                        '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px;">' +
                        '<button type="button" class="button outbound-nl-pick-media" data-target-url="#' + colUid + '-right-url" data-target-preview="#' + colUid + '-right-preview">Upload / Choose Photo</button>' +
                        '<button type="button" class="button button-link-delete outbound-nl-clear-media" data-target-url="#' + colUid + '-right-url" data-target-preview="#' + colUid + '-right-preview" data-empty-label="No right photo">Remove</button>' +
                        '</div>' +
                        '<div id="' + colUid + '-right-preview">' + rightPreview + '</div>' +
                        '</div>' +
                        '</div>';
                } else if (blk.type === 'divider') {
                    body += '<select class="outbound-blk-field" data-key="style">' +
                        '<option value="line"' + (blk.style !== 'spacer' ? ' selected' : '') + '>Subtle Horizontal Line</option>' +
                        '<option value="spacer"' + (blk.style === 'spacer' ? ' selected' : '') + '>Clean Vertical Spacer</option>' +
                        '</select>';
                }
                body += '</div>';

                $card.html(header + body);
                $container.append($card);
            });

            sync();
        }

        $container.on('input change', '.outbound-blk-field', function () {
            var idx = Number($(this).closest('.outbound-nl-block-card').data('idx'));
            var key = $(this).data('key');
            if (blocks[idx]) {
                blocks[idx][key] = $(this).val();
                sync();
            }
        });

        $container.on('input change', '.outbound-blk-list', function () {
            var idx = Number($(this).closest('.outbound-nl-block-card').data('idx'));
            if (blocks[idx]) {
                blocks[idx].items = $(this).val().split(/\r?\n/).map(function (s) { return s.trim(); }).filter(Boolean);
                sync();
            }
        });

        $container.on('click', '.outbound-blk-remove', function () {
            var idx = Number($(this).closest('.outbound-nl-block-card').data('idx'));
            blocks.splice(idx, 1);
            renderBlocks();
        });

        $container.on('click', '.outbound-blk-up', function () {
            var idx = Number($(this).closest('.outbound-nl-block-card').data('idx'));
            if (idx > 0) {
                var tmp = blocks[idx - 1];
                blocks[idx - 1] = blocks[idx];
                blocks[idx] = tmp;
                renderBlocks();
            }
        });

        $container.on('click', '.outbound-blk-down', function () {
            var idx = Number($(this).closest('.outbound-nl-block-card').data('idx'));
            if (idx < blocks.length - 1) {
                var tmp = blocks[idx + 1];
                blocks[idx + 1] = blocks[idx];
                blocks[idx] = tmp;
                renderBlocks();
            }
        });

        $(document).on('click', '.outbound-nl-add-block', function () {
            var type = $(this).data('type') || 'paragraph';
            blocks.push(defaultBlock(type));
            renderBlocks();
        });

        $(document).on('click', '.outbound-nl-insert-snippet', function () {
            var raw = $(this).attr('data-blocks');
            if (!raw) {
                return;
            }
            try {
                var snippetBlocks = JSON.parse(raw);
                if (Array.isArray(snippetBlocks)) {
                    blocks = blocks.concat(snippetBlocks);
                    renderBlocks();
                }
            } catch (err) {}
        });

        $('#outbound-nl-toggle-html').on('change', function () {
            var useRaw = $(this).is(':checked');
            $('#outbound-nl-raw-html-wrap').toggle(useRaw);
            $('#outbound-nl-visual-blocks-wrap').toggle(!useRaw);
        });

        renderBlocks();
    }

    function initPreviewAndConfirmation() {
        $(document).on('click', '.outbound-nl-preview-mode', function () {
            var mode = $(this).data('mode');
            $('.outbound-nl-preview-mode').removeClass('button-primary');
            $(this).addClass('button-primary');

            var $frame = $('#outbound-nl-preview-frame');
            var $text = $('#outbound-nl-preview-text');
            if (mode === 'text') {
                $frame.hide();
                $text.show();
            } else {
                $text.hide();
                $frame.show().css('max-width', mode === 'mobile' ? '390px' : '100%');
            }
        });

        $(document).on('click', '#outbound-nl-refresh-preview', function (e) {
            e.preventDefault();
            var $form = $('#outbound-nl-composer-form');
            var ajaxUrl = $form.data('preview-url');
            if (!ajaxUrl) {
                return;
            }
            var data = $form.serializeArray();
            data.push({ name: 'action', value: 'outbound_newsletter_live_preview' });
            $.post(ajaxUrl, data, function (res) {
                if (res && res.success && res.data) {
                    var iframe = document.getElementById('outbound-nl-preview-frame');
                    if (iframe) {
                        iframe.srcdoc = res.data.html || '';
                    }
                    $('#outbound-nl-preview-text pre').text(res.data.text || '');
                }
            });
        });

        $(document).on('click', '.outbound-nl-send-now-btn', function (e) {
            var subj = ($('#outbound-nl-subject').val() || '(no subject)').trim();
            var audText = $('#outbound-confirm-audience').text() || 'selected confirmed audience';
            var msg = 'Confirm queuing this campaign now?\n\nSubject: ' + subj + '\nAudience: ' + audText + '\n\nUnsubscribed and suppressed contacts are automatically excluded.';
            if (!window.confirm(msg)) {
                e.preventDefault();
            }
        });
    }

    $(function () {
        initInboxPreview();
        initMediaPickers();
        initTemplateSelector();
        initBlockEditor();
        initPreviewAndConfirmation();
    });
})(jQuery);
