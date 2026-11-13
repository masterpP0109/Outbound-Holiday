(function ($) {
  'use strict';

  function refreshMediaPreview($input) {
    var val = $.trim($input.val());
    var previewSel = $input.data('preview');
    if (previewSel) {
      var $img = $(previewSel);
      if (val) {
        $img.attr('src', val).addClass('has-src');
      } else {
        $img.attr('src', '').removeClass('has-src');
      }
    }
    var $box = $input.closest('.outbound-media-field').find('.outbound-media-preview-box');
    if ($box.length) {
      if (val) {
        $box.addClass('has-image').html('<img src="' + $('<div>').text(val).html() + '" alt="" class="outbound-media-thumb" />');
      } else {
        $box.removeClass('has-image').html('<span class="outbound-media-placeholder">No photo</span>');
      }
    }
    var $galThumb = $input.closest('.outbound-gallery-card').find('.outbound-gallery-card-thumb');
    if ($galThumb.length) {
      if (val) {
        $galThumb.html('<img src="' + $('<div>').text(val).html() + '" alt="" />');
      } else {
        $galThumb.html('<span class="outbound-media-placeholder">No photo</span>');
      }
    }
  }

  // Legacy textarea multi-image picker
  $(document).on('click', '.outbound-media-multi-btn', function (e) {
    e.preventDefault();
    var $target = $($(this).data('target'));
    if (!$target.length || typeof wp === 'undefined' || !wp.media) return;

    var frame = wp.media({
      title: 'Select Images for Outbound Holidays Gallery',
      button: { text: 'Insert Selected Images' },
      multiple: true
    });

    frame.on('select', function () {
      var selection = frame.state().get('selection').toJSON();
      var existing = $target.val() ? $target.val().split(/\r?\n/).filter(Boolean) : [];
      selection.forEach(function (att) {
        if (att.url && existing.indexOf(att.url) === -1) {
          existing.push(att.url);
        }
      });
      $target.val(existing.join('\n'));
    });

    frame.open();
  });

  // Visual Gallery Card Multi-Add from WP Media Library
  $(document).on('click', '.outbound-gallery-multi-btn', function (e) {
    e.preventDefault();
    var $list = $($(this).data('gallery-list'));
    if (!$list.length || typeof wp === 'undefined' || !wp.media) return;

    var frame = wp.media({
      title: 'Add Photos to Gallery',
      button: { text: 'Add Selected Photos' },
      multiple: true
    });

    frame.on('select', function () {
      var selection = frame.state().get('selection').toJSON();
      selection.forEach(function (att) {
        if (!att || !att.url) return;
        // Reuse first empty slot if present
        var $emptyInput = $list.find('.outbound-gallery-url-input').filter(function () {
          return $.trim($(this).val()) === '';
        }).first();

        if ($emptyInput.length) {
          $emptyInput.val(att.url).trigger('input');
          var $card = $emptyInput.closest('.outbound-gallery-card');
          if (att.alt) $card.find('input[name$="[alt]"]').val(att.alt);
          if (att.caption) $card.find('input[name$="[caption]"]').val(att.caption);
          return;
        }

        var $tpl = $list.children('.outbound-repeater-row').last();
        if (!$tpl.length) return;
        var $clone = cloneCleanRow($tpl);
        $clone.find('.outbound-gallery-url-input').val(att.url).trigger('input');
        if (att.alt) $clone.find('input[name$="[alt]"]').val(att.alt);
        if (att.caption) $clone.find('input[name$="[caption]"]').val(att.caption);
        $list.append($clone);
        reindexList($list);
      });
    });

    frame.open();
  });

  // Visual Gallery Card Replace Single Photo
  $(document).on('click', '.outbound-gallery-replace-btn', function (e) {
    e.preventDefault();
    var $input = $($(this).data('target-input'));
    if (!$input.length || typeof wp === 'undefined' || !wp.media) return;

    var frame = wp.media({
      title: 'Replace Gallery Photo',
      button: { text: 'Use Photo' },
      multiple: false
    });

    frame.on('select', function () {
      var att = frame.state().get('selection').first().toJSON();
      if (att && att.url) {
        $input.val(att.url).trigger('input');
      }
    });

    frame.open();
  });

  // Set a Gallery Photo as Primary / Hero Image
  $(document).on('click', '.outbound-set-hero-btn', function (e) {
    e.preventDefault();
    var srcUrl = $.trim($($(this).data('source-input')).val());
    var $heroInput = $($(this).data('hero-input'));
    if (srcUrl && $heroInput.length) {
      $heroInput.val(srcUrl).trigger('input');
    }
  });

  // Single-image Media Library picker
  $(document).on('click', '.outbound-media-single-btn', function (e) {
    e.preventDefault();
    var $target = $($(this).data('target'));
    if (!$target.length || typeof wp === 'undefined' || !wp.media) return;

    var frame = wp.media({
      title: 'Select Image from WordPress Media Library',
      button: { text: 'Use Selected Image' },
      multiple: false
    });

    frame.on('select', function () {
      var att = frame.state().get('selection').first().toJSON();
      if (att && att.url) {
        $target.val(att.url).trigger('input');
      }
    });

    frame.open();
  });

  $(document).on('click', '.outbound-media-clear-btn', function (e) {
    e.preventDefault();
    var $target = $($(this).data('target'));
    if ($target.length) {
      $target.val('').trigger('input');
    }
  });

  $(document).on('input', '.outbound-media-url-input, .outbound-media-input, .outbound-gallery-url-input', function () {
    var $input = $(this);
    refreshMediaPreview($input);
    if ($input.attr('id') === 'outbound_hero_img_picker') {
      var url = $.trim($input.val());
      if (url) {
        $('.outbound-hero-mockup').css('background-image', "linear-gradient(100deg, rgba(13,40,51,0.88), rgba(11,94,142,0.52)), url('" + url + "')");
      }
    }
  });

  // Live Hero text preview
  $(document).on('input', '.outbound-live-hero-input', function () {
    var target = $(this).data('hero-target');
    if (!target) return;
    var val = $.trim($(this).val());
    if (val) {
      $(target).text(val);
    }
  });

  // Escape regex metacharacters for safe prefix replacement in nested repeaters
  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function cloneCleanRow($tpl, preserveValues) {
    var $clone = $tpl.clone();
    if (!preserveValues) {
      $clone.find('input[type="text"], input[type="url"], input[type="number"], textarea').val('');
      $clone.find('input[type="checkbox"]').prop('checked', true);
      $clone.find('.outbound-media-thumb').attr('src', '').removeClass('has-src');
      $clone.find('.outbound-media-preview-box').removeClass('has-image').html('<span class="outbound-media-placeholder">No photo</span>');
      $clone.find('.outbound-gallery-card-thumb').html('<span class="outbound-media-placeholder">No photo</span>');
      $clone.find('input[name$="[stepNumber]"], input[name$="[step]"]').val('');
      // If duplicating/adding a Chapter, trim sub-blocks down to 1 clean block
      var $subList = $clone.find('.outbound-subrepeater-list');
      if ($subList.length) {
        $subList.each(function () {
          var $blocks = $(this).children('.outbound-repeater-row');
          $blocks.slice(1).remove();
          $blocks.first().find('input[type="text"], textarea').val('');
        });
      }
    }
    var ts = Date.now() + '_' + Math.floor(Math.random() * 999);
    $clone.find('[id]').each(function () {
      var oldId = $(this).attr('id');
      if (!oldId) return;
      var newId = oldId + '_' + ts;
      $(this).attr('id', newId);
      $clone.find('[data-target="#' + oldId + '"]').attr('data-target', '#' + newId);
      $clone.find('[data-target-input="#' + oldId + '"]').attr('data-target-input', '#' + newId);
      $clone.find('[data-source-input="#' + oldId + '"]').attr('data-source-input', '#' + newId);
      $clone.find('[data-preview="#' + oldId + '_preview"]').attr('data-preview', '#' + newId + '_preview');
    });
    return $clone;
  }

  // Reindex direct child rows safely using exact data-repeater-prefix (or fallback regex)
  function reindexList($list) {
    var prefix = $list.attr('data-repeater-prefix');
    var $rows = $list.children('.outbound-repeater-row');

    $rows.each(function (newIdx) {
      var $row = $(this);
      $row.children('.outbound-row-handle').text(newIdx + 1);
      $row.find('> .outbound-repeater-card-head .outbound-row-num, > .outbound-row-num').text(newIdx + 1);

      if (prefix) {
        var rx = new RegExp('^' + escapeRegex(prefix) + '(\\d+)\\]');
        var newSeg = prefix + newIdx + ']';
        $row.find('[name]').each(function () {
          var name = $(this).attr('name');
          if (name && rx.test(name)) {
            $(this).attr('name', name.replace(rx, newSeg));
          }
        });
        $row.find('[data-repeater-prefix]').each(function () {
          var subPref = $(this).attr('data-repeater-prefix');
          if (subPref && rx.test(subPref)) {
            $(this).attr('data-repeater-prefix', subPref.replace(rx, newSeg));
          }
        });
      } else {
        $row.find('[name]').each(function () {
          var name = $(this).attr('name');
          if (name) {
            $(this).attr('name', name.replace(/\[(\d+)\]/, '[' + newIdx + ']'));
          }
        });
      }
    });

    // Recursively reindex any nested lists
    $list.find('.outbound-repeater-list').each(function () {
      reindexList($(this));
    });
  }

  function findListFromControl($btn) {
    var targetSel = $btn.data('target');
    if (targetSel) {
      var $explicit = $(targetSel);
      if ($explicit.length) return $explicit;
    }
    var $prev = $btn.prev('.outbound-repeater-list');
    if ($prev.length) return $prev;
    var $closestRow = $btn.closest('.outbound-repeater-row');
    if ($closestRow.length) {
      return $btn.closest('.outbound-repeater-list');
    }
    return $btn.closest('.outbound-repeater, .outbound-editor-subsection, .outbound-nested-blocks-wrap').find('.outbound-repeater-list').first();
  }

  $(document).on('click', '.outbound-row-add, .outbound-row-add-target', function () {
    var $list = findListFromControl($(this));
    if (!$list.length) return;
    var $tpl = $list.children('.outbound-repeater-row').last();
    if (!$tpl.length) return;
    var $clone = cloneCleanRow($tpl, false);
    $list.append($clone);
    reindexList($list);
  });

  $(document).on('click', '.outbound-row-duplicate', function () {
    var $row = $(this).closest('.outbound-repeater-row');
    var $list = $row.parent('.outbound-repeater-list');
    if (!$row.length || !$list.length) return;
    var $clone = cloneCleanRow($row, true);
    $row.after($clone);
    reindexList($list);
  });

  $(document).on('click', '.outbound-row-remove', function () {
    var $row = $(this).closest('.outbound-repeater-row');
    var $list = $row.parent('.outbound-repeater-list');
    if (!$row.length || !$list.length) return;
    if ($list.children('.outbound-repeater-row').length <= 1) {
      if (!window.confirm('Clear this item row? At least one slot stays visible.')) return;
      $row.find('input[type="text"], input[type="url"], input[type="number"], textarea').val('');
      refreshMediaPreview($row.find('.outbound-media-input, .outbound-gallery-url-input'));
      return;
    }
    if (!window.confirm('Remove this item? Click Save Draft or Publish to persist removal.')) return;
    $row.remove();
    reindexList($list);
  });

  $(document).on('click', '.outbound-row-up', function () {
    var $row = $(this).closest('.outbound-repeater-row');
    var $list = $row.parent('.outbound-repeater-list');
    var $prev = $row.prev('.outbound-repeater-row');
    if ($prev.length) {
      $row.insertBefore($prev);
      reindexList($list);
    }
  });

  $(document).on('click', '.outbound-row-down', function () {
    var $row = $(this).closest('.outbound-repeater-row');
    var $list = $row.parent('.outbound-repeater-list');
    var $next = $row.next('.outbound-repeater-row');
    if ($next.length) {
      $row.insertAfter($next);
      reindexList($list);
    }
  });

  // Guide block type pane switcher
  $(document).on('change', '.outbound-block-type-select', function () {
    var val = $(this).val();
    var $card = $(this).closest('.outbound-block-card');
    $card.find('.outbound-block-pane').each(function () {
      var types = String($(this).attr('data-show-for') || '').split(/\s+/);
      if (types.indexOf(val) !== -1) {
        $(this).show();
      } else {
        $(this).hide();
      }
    });
  });

  // Related multi-select chip visual highlight
  $(document).on('change', '.outbound-related-chip input[type="checkbox"]', function () {
    $(this).closest('.outbound-related-chip').toggleClass('is-checked', $(this).is(':checked'));
  });

  // Design token color picker <-> hex input sync
  $(document).on('input change', '.outbound-color-picker', function () {
    var $hex = $($(this).data('target'));
    if ($hex.length) $hex.val(String($(this).val()).toUpperCase());
  });
  $(document).on('input', '.outbound-color-hex', function () {
    var val = $.trim($(this).val());
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      $(this).closest('.outbound-color-field').find('.outbound-color-picker').val(val);
    }
  });

  // SEO route search navigation without nested form
  $(document).on('click', '#outbound-seo-filter-btn', function () {
    var base = $(this).data('base-url');
    var q = $.trim($('#outbound-seo-filter-input').val());
    window.location.href = q ? (base + '&q=' + encodeURIComponent(q)) : base;
  });
})(jQuery);
