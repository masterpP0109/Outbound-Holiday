(function ($) {
  'use strict';

  function escConfirm(v) {
    return String(v === undefined || v === null ? '' : v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /**
   * Accessible two-step / safe confirmation dialog replacing native window.confirm.
   * opts: { title, bodyHtml, detailsList?, safetyNote?, confirmLabel?, confirmClass?, requireText?, onConfirm }
   */
  function outboundConfirmDialog(opts) {
    $('#outbound-confirm-modal-backdrop').remove();
    var confirmLabel = opts.confirmLabel || 'Confirm';
    var confirmClass = opts.confirmClass || 'button-primary';
    var reqText = opts.requireText ? String(opts.requireText) : '';
    var listHtml = '';
    if (Array.isArray(opts.detailsList) && opts.detailsList.length) {
      listHtml = '<ul class="outbound-confirm-list">' + opts.detailsList.map(function (item) {
        return '<li>' + escConfirm(item) + '</li>';
      }).join('') + '</ul>';
    }
    var safetyHtml = opts.safetyNote
      ? '<p class="outbound-confirm-safety">' + escConfirm(opts.safetyNote) + '</p>'
      : '';
    var requireHtml = reqText
      ? '<div class="outbound-confirm-typebox"><label>Type <code>' + escConfirm(reqText) + '</code> to confirm permanent deletion:<br><input type="text" id="outbound-confirm-type-input" autocomplete="off" /></label></div>'
      : '';

    var modalHtml = '' +
      '<div id="outbound-confirm-modal-backdrop" class="outbound-confirm-backdrop" role="dialog" aria-modal="true" aria-labelledby="outbound-confirm-title">' +
      '  <div class="outbound-confirm-dialog">' +
      '    <div class="outbound-confirm-head">' +
      '      <h3 id="outbound-confirm-title">' + escConfirm(opts.title || 'Confirm Action') + '</h3>' +
      '      <button type="button" class="outbound-confirm-close" aria-label="Close">&times;</button>' +
      '    </div>' +
      '    <div class="outbound-confirm-body">' +
      '      <div>' + (opts.bodyHtml || '') + '</div>' +
      listHtml +
      safetyHtml +
      requireHtml +
      '    </div>' +
      '    <div class="outbound-confirm-foot">' +
      '      <button type="button" class="button outbound-confirm-cancel">Cancel</button>' +
      '      <button type="button" class="button ' + escConfirm(confirmClass) + ' outbound-confirm-ok" ' + (reqText ? 'disabled' : '') + '>' + escConfirm(confirmLabel) + '</button>' +
      '    </div>' +
      '  </div>' +
      '</div>';

    var $modal = $(modalHtml).appendTo('body');
    var $okBtn = $modal.find('.outbound-confirm-ok');
    var $typeInp = $modal.find('#outbound-confirm-type-input');

    function closeModal() {
      $(document).off('keydown.outboundConfirm');
      $modal.remove();
    }

    if ($typeInp.length) {
      $typeInp.on('input', function () {
        var matches = $.trim($(this).val()).toUpperCase() === reqText.toUpperCase();
        $okBtn.prop('disabled', !matches);
      });
      setTimeout(function () { $typeInp.trigger('focus'); }, 20);
    } else {
      setTimeout(function () { $modal.find('.outbound-confirm-cancel').trigger('focus'); }, 20);
    }

    $modal.on('click', '.outbound-confirm-close, .outbound-confirm-cancel', closeModal);
    $modal.on('click', function (e) {
      if (e.target === $modal[0]) closeModal();
    });
    $(document).on('keydown.outboundConfirm', function (e) {
      if (e.key === 'Escape') closeModal();
    });
    $okBtn.on('click', function () {
      if ($okBtn.prop('disabled')) return;
      closeModal();
      if (typeof opts.onConfirm === 'function') opts.onConfirm();
    });
  }

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

  // =========================================================================
  // Dynamic Accommodation Room / Unit Type Manager
  // =========================================================================
  function escHtml(str) {
    return String(str === undefined || str === null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function genUnitId(prefix) {
    return (prefix || 'unit_') + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
  }

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function createEmptyUnit() {
    return {
      id: genUnitId('unit_'),
      name: 'New Room / Unit Type',
      shortDescription: '',
      description: '',
      unitCategory: '',
      wing: '',
      isEntireProperty: false,
      sizeSqm: null,
      unitCount: null,
      featured: false,
      status: 'published',
      availabilityStatus: 'available',
      customCtaLabel: '',
      occupancy: '2 Adults',
      imageUrl: '',
      gallery: [],
      features: [],
      amenities: [],
      customAmenities: [],
      accessibilityFeatures: [],
      inclusions: [],
      ratePlanIds: [],
      occupancyConfig: {
        maxAdults: 2,
        maxChildren: 0,
        maxTotalGuests: 2,
        bedrooms: 1,
        bathrooms: 1,
        beds: [{ type: 'King Bed', quantity: 1 }],
        extraBedAvailable: false,
        extraBedNotes: '',
        childAgePolicy: '',
        additionalGuestChargeNote: '',
        interleadingInfo: ''
      },
      pricing: {
        baseNightlyRateUSD: null,
        startingFromPriceUSD: null,
        weekendRateUSD: null,
        weekendDays: ['fri', 'sat'],
        baseOccupancyAdults: 2,
        additionalGuestRateUSD: null,
        childRateUSD: null,
        childRate11PlusUSD: null,
        minStayNights: null,
        rateValidFrom: '',
        rateValidTo: '',
        rateStatus: 'provisional',
        priceBasis: 'per_room',
        seasonalRates: [],
        dateSpecificRates: [],
        mealPlanRates: [],
        inclusions: [],
        exclusions: []
      },
      policies: {
        minStayNights: null,
        checkInRestrictions: '',
        cancellationPolicy: '',
        extraPersonPolicy: '',
        accessibilityInfo: '',
        otherRestrictions: ''
      },
      internalSupplierRate: '',
      internalNotes: ''
    };
  }

  function matchLegacyFeatureToAmenityId(featureLabel, amenityOptions) {
    var lower = String(featureLabel || '').toLowerCase();
    if (!lower) return '';
    for (var i = 0; i < amenityOptions.length; i++) {
      var opt = amenityOptions[i];
      if (!opt || !opt.id) continue;
      if (lower === String(opt.id).toLowerCase() || lower === String(opt.label).toLowerCase()) {
        return opt.id;
      }
    }
    var rules = [
      ['ac', /\bair\s*cond|\ba\/c\b/i],
      ['wifi', /\bwi-?fi\b/i],
      ['tv', /\btv\b|television/i],
      ['bathtub', /bathtub|jacuzzi|soaking\s*tub/i],
      ['shower', /\bshower\b/i],
      ['private-bathroom', /en-?suite|private\s*bath/i],
      ['balcony', /balcony|veranda|terrace|\bpatio\b|\bdeck\b/i],
      ['river-view', /river\s*view|zambezi\s*view|water\s*view/i],
      ['garden-view', /garden\s*view|lawn\s*view/i],
      ['minibar', /mini\s*bar/i],
      ['kitchenette', /kitchen/i],
      ['private-pool', /private\s*pool|plunge\s*pool/i],
      ['tea-coffee', /\btea\b|\bcoffee\b|espresso|nespresso/i],
      ['safe', /\bsafe\b/i],
      ['workspace', /work\s*space|\bdesk\b/i]
    ];
    for (var r = 0; r < rules.length; r++) {
      if (rules[r][1].test(lower)) return rules[r][0];
    }
    return '';
  }

  function parseLegacyOccupancy(occupancyText, features) {
    var txt = String(occupancyText || '');
    var adultsMatch = txt.match(/(\d+)\s*adult/i);
    var childMatch = txt.match(/(\d+)\s*child/i);
    var guestMatch = txt.match(/up\s*to\s*(\d+)|(\d+)\s*guest/i);
    var adults = adultsMatch ? Number(adultsMatch[1]) : (guestMatch ? Number(guestMatch[1] || guestMatch[2]) : 2);
    var children = childMatch ? Number(childMatch[1]) : 0;
    var total = guestMatch ? Math.max(adults + children, Number(guestMatch[1] || guestMatch[2]) || 2) : Math.max(1, adults + children);
    var combined = (txt + ' ' + (Array.isArray(features) ? features.join(' ') : '')).toLowerCase();
    var beds = [];
    if (/\bking\b/i.test(combined)) beds.push({ type: 'King Bed', quantity: 1 });
    if (/\btwin\b/i.test(combined)) beds.push({ type: 'Twin Beds', quantity: 2 });
    if (/\bqueen\b/i.test(combined) && !beds.length) beds.push({ type: 'Queen Bed', quantity: 1 });
    return {
      maxAdults: Math.max(1, adults),
      maxChildren: Math.max(0, children),
      maxTotalGuests: Math.max(1, total),
      beds: beds
    };
  }

  function normalizeUnitForEditor(raw, amenityOptions) {
    var hasExplicitOcc = Boolean(raw && raw.occupancyConfig && typeof raw.occupancyConfig === 'object');
    var hasExplicitAmenities = Boolean(raw && Array.isArray(raw.amenities) && raw.amenities.length);
    var hasExplicitCustomAmenities = Boolean(raw && Array.isArray(raw.customAmenities) && raw.customAmenities.length);

    var u = $.extend(true, createEmptyUnit(), raw || {});
    if (!u.id) u.id = genUnitId('unit_');
    if (!u.occupancyConfig) u.occupancyConfig = createEmptyUnit().occupancyConfig;
    if (!Array.isArray(u.occupancyConfig.beds)) u.occupancyConfig.beds = [];
    if (!hasExplicitOcc && u.occupancy) {
      var parsedOcc = parseLegacyOccupancy(u.occupancy, u.features);
      u.occupancyConfig.maxAdults = parsedOcc.maxAdults;
      u.occupancyConfig.maxChildren = parsedOcc.maxChildren;
      u.occupancyConfig.maxTotalGuests = parsedOcc.maxTotalGuests;
      if (!u.occupancyConfig.beds.length && parsedOcc.beds.length) {
        u.occupancyConfig.beds = parsedOcc.beds;
      }
    }
    if (!u.pricing) u.pricing = createEmptyUnit().pricing;
    if (!Array.isArray(u.pricing.weekendDays) || !u.pricing.weekendDays.length) u.pricing.weekendDays = ['fri', 'sat'];
    if (!Array.isArray(u.pricing.seasonalRates)) u.pricing.seasonalRates = [];
    if (!Array.isArray(u.pricing.dateSpecificRates)) u.pricing.dateSpecificRates = [];
    if (!Array.isArray(u.pricing.mealPlanRates)) u.pricing.mealPlanRates = [];
    if (!Array.isArray(u.pricing.inclusions)) u.pricing.inclusions = [];
    if (!Array.isArray(u.pricing.exclusions)) u.pricing.exclusions = [];
    if (!u.policies) u.policies = createEmptyUnit().policies;
    if (!Array.isArray(u.gallery)) {
      u.gallery = Array.isArray(u.galleryImages)
        ? u.galleryImages.map(function (url, idx) { return { id: 'img-' + (idx + 1), url: url, alt: '', caption: '' }; })
        : [];
    }
    if (!Array.isArray(u.amenities)) u.amenities = [];
    if (!Array.isArray(u.customAmenities)) {
      u.customAmenities = [];
    }
    if (!Array.isArray(u.accessibilityFeatures)) u.accessibilityFeatures = [];
    if (!Array.isArray(u.inclusions)) u.inclusions = [];
    if (!Array.isArray(u.ratePlanIds)) u.ratePlanIds = [];
    if (!Array.isArray(u.features)) u.features = [];
    // If legacy features exist without structured amenities, map matching presets into checkboxes and keep remaining as custom tags.
    if (u.features.length && !hasExplicitAmenities && !hasExplicitCustomAmenities) {
      var mappedIds = [];
      var unmatched = [];
      u.features.forEach(function (feat) {
        var matchedId = matchLegacyFeatureToAmenityId(feat, amenityOptions || []);
        if (matchedId) {
          if (mappedIds.indexOf(matchedId) === -1) mappedIds.push(matchedId);
        } else if (unmatched.indexOf(feat) === -1) {
          unmatched.push(feat);
        }
      });
      u.amenities = mappedIds;
      u.customAmenities = unmatched;
    }
    return u;
  }

  function initRoomUnitManager() {
    var $cfgEl = $('#outbound-unit-manager-config');
    var $list = $('#outbound-unit-manager-list');
    var $jsonInput = $('#outbound_rooms_json_input');
    if (!$cfgEl.length || !$list.length || !$jsonInput.length || $list.data('outbound-initialized')) return;
    $list.data('outbound-initialized', true);

    var cfg;
    try {
      cfg = JSON.parse($cfgEl.text() || '{}');
    } catch (_e) {
      cfg = { units: [], amenityOptions: [], inclusionPresets: [], canEditInternal: false };
    }

    var amenityOptions = Array.isArray(cfg.amenityOptions) ? cfg.amenityOptions : [];
    var inclusionPresets = Array.isArray(cfg.inclusionPresets) ? cfg.inclusionPresets : [];
    var canEditInternal = Boolean(cfg.canEditInternal);
    var units = (Array.isArray(cfg.units) ? cfg.units : []).map(function (raw) {
      return normalizeUnitForEditor(raw, amenityOptions);
    });
    var expandedIds = {};
    var activeSubTab = {};
    var dragUnitIdx = null;
    var dragPhotoState = null;
    var unitFilterStatus = 'active';
    var unitSearchQuery = '';

    function computeStartingPriceLabel(u) {
      var p = u.pricing || {};
      var start = p.startingFromPriceUSD || p.baseNightlyRateUSD;
      if (start && Number(start) > 0) {
        return 'From US$' + Number(start) + '/night';
      }
      return 'Price on enquiry';
    }

    function computeCapacitySummary(u) {
      var occ = u.occupancyConfig || {};
      if (occ.maxTotalGuests) {
        return 'Max ' + occ.maxTotalGuests + ' guests';
      }
      if (occ.maxAdults) {
        var c = occ.maxChildren ? (' + ' + occ.maxChildren + 'C') : '';
        return occ.maxAdults + 'A' + c;
      }
      return u.occupancy || '2 Guests';
    }

    function syncHiddenJson() {
      var amLabelMap = {};
      amenityOptions.forEach(function (opt) {
        amLabelMap[opt.id] = opt.label;
      });
      var counts = { active: 0, published: 0, draft: 0, archived: 0, trashed: 0 };
      units.forEach(function (u) {
        var st = u.status || 'published';
        if (st === 'trashed') {
          counts.trashed++;
        } else {
          counts.active++;
          if (st === 'published') counts.published++;
          else if (st === 'archived') counts.archived++;
          else counts.draft++;
        }
        var rebuilt = [];
        var seen = {};
        (u.amenities || []).forEach(function (aid) {
          var lbl = amLabelMap[aid] || aid;
          var k = String(lbl).toLowerCase();
          if (lbl && !seen[k]) { seen[k] = true; rebuilt.push(lbl); }
        });
        (u.customAmenities || []).forEach(function (ca) {
          var k = String(ca).toLowerCase();
          if (ca && !seen[k]) { seen[k] = true; rebuilt.push(ca); }
        });
        u.features = rebuilt;
      });
      $jsonInput.val(JSON.stringify(units));
      $('#outbound-unit-count-badge').text(counts.active);
      $('#outbound-u-cnt-active').text(counts.active);
      $('#outbound-u-cnt-pub').text(counts.published);
      $('#outbound-u-cnt-draft').text(counts.draft);
      $('#outbound-u-cnt-arch').text(counts.archived);
      $('#outbound-u-cnt-trash').text(counts.trashed);
    }

    function buildUnitCardHtml(u, idx) {
      var isExpanded = Boolean(expandedIds[u.id]);
      var tab = activeSubTab[u.id] || 'basic';
      var status = u.status || 'published';
      var statusLabel = status === 'published' ? 'Published' : (status === 'archived' ? 'Archived' : (status === 'trashed' ? 'Trashed' : 'Draft'));
      var statusClass = status === 'published' ? 'outbound-badge-green' : (status === 'archived' ? 'outbound-nl-badge--archived' : (status === 'trashed' ? 'outbound-badge-red' : 'outbound-badge-amber'));
      var thumbUrl = u.imageUrl || (u.gallery[0] && u.gallery[0].url) || '';

      var html = '<div class="outbound-unit-card ' + (status === 'trashed' ? 'is-trashed' : '') + '" data-unit-idx="' + idx + '" data-unit-id="' + escHtml(u.id) + '" draggable="true">';
      // Header
      html += '<div class="outbound-unit-card-header">';
      html += '  <div class="outbound-unit-header-left">';
      html += '    <span class="outbound-unit-drag-handle" title="Drag to reorder">&#8942;&#8942;</span>';
      html += '    <div class="outbound-unit-thumb">' + (thumbUrl ? '<img src="' + escHtml(thumbUrl) + '" alt="" />' : '<span>No photo</span>') + '</div>';
      html += '    <div class="outbound-unit-meta">';
      html += '      <div class="outbound-unit-title-row">';
      html += '        <strong class="outbound-unit-card-name">' + escHtml(u.name || 'Untitled Unit') + '</strong>';
      if (u.wing) html += ' <span class="outbound-unit-cat-pill" style="background:#FEF3C7;color:#92400E;">' + escHtml(u.wing) + '</span>';
      if (u.unitCategory) html += ' <span class="outbound-unit-cat-pill">' + escHtml(u.unitCategory) + '</span>';
      if (u.isEntireProperty) html += ' <span class="outbound-badge outbound-badge-blue">Entire Home / Exclusive Use</span>';
      if (u.featured) html += ' <span class="outbound-badge outbound-badge-blue">Featured</span>';
      if (u.availabilityStatus === 'on_request') html += ' <span class="outbound-badge outbound-badge-amber">On Request</span>';
      if (u.availabilityStatus === 'temporarily_unavailable') html += ' <span class="outbound-badge outbound-badge-rose">Unavailable</span>';
      html += '        <span class="outbound-badge ' + statusClass + '">' + statusLabel + '</span>';
      html += '      </div>';
      html += '      <div class="outbound-unit-sub-row">';
      html += '        <span class="outbound-unit-price-pill">' + escHtml(computeStartingPriceLabel(u)) + '</span>';
      html += '        <span>&middot;</span>';
      html += '        <span class="outbound-unit-cap-pill">' + escHtml(computeCapacitySummary(u)) + '</span>';
      html += '        <span>&middot;</span>';
      html += '        <code style="font-size:10px;">' + escHtml(u.id) + '</code>';
      html += '      </div>';
      html += '    </div>';
      html += '  </div>';
      html += '  <div class="outbound-unit-header-actions">';
      if (status === 'trashed') {
        html += '    <button type="button" class="button button-small outbound-unit-restore">Restore to Draft</button>';
        html += '    <button type="button" class="button button-small button-primary outbound-unit-restore-publish">Restore &amp; Publish</button>';
        html += '    <button type="button" class="button-link-delete outbound-unit-perm-delete">Delete Forever</button>';
      } else {
        html += '    <button type="button" class="button button-small outbound-unit-move-up" title="Move Up">&uarr;</button>';
        html += '    <button type="button" class="button button-small outbound-unit-move-down" title="Move Down">&darr;</button>';
        html += '    <button type="button" class="button button-small outbound-unit-toggle-featured">' + (u.featured ? 'Unfeature' : 'Set Featured') + '</button>';
        html += '    <button type="button" class="button button-small outbound-unit-toggle-status">' + (status === 'published' ? 'Unpublish' : 'Publish') + '</button>';
        html += '    <button type="button" class="button button-small outbound-unit-duplicate">Duplicate</button>';
        html += '    <button type="button" class="button button-small outbound-unit-archive">' + (status === 'archived' ? 'Restore' : 'Archive') + '</button>';
        html += '    <button type="button" class="button button-small ' + (isExpanded ? 'outbound-edit-cta-active' : 'outbound-edit-cta') + ' outbound-unit-edit-toggle">' + (isExpanded ? 'Done / Collapse' : '<span class="dashicons dashicons-edit" aria-hidden="true"></span><span>Edit Unit</span>') + '</button>';
        html += '    <button type="button" class="button-link-delete outbound-unit-delete">Move to Trash</button>';
      }
      html += '  </div>';
      html += '</div>';

      if (isExpanded) {
        html += '<div class="outbound-unit-card-body">';
        // Sub-navigation tabs for clean A-G editing
        var tabs = [
          { id: 'basic', label: 'A. Basic Info' },
          { id: 'occupancy', label: 'B. Occupancy' },
          { id: 'pricing', label: 'C. Pricing & Rates' },
          { id: 'gallery', label: 'D. Room Gallery (' + (u.gallery.length + (u.imageUrl ? 1 : 0)) + ')' },
          { id: 'amenities', label: 'E. Amenities' },
          { id: 'inclusions', label: 'F. Extras & Inclusions' },
          { id: 'policies', label: 'G. Policies & Notes' }
        ];
        html += '<div class="outbound-unit-tabs">';
        tabs.forEach(function (t) {
          html += '<button type="button" class="outbound-unit-tab-btn ' + (tab === t.id ? 'is-active' : '') + '" data-tab="' + t.id + '">' + escHtml(t.label) + '</button>';
        });
        html += '</div>';

        // A. Basic Info
        html += '<div class="outbound-unit-pane" data-pane="basic" style="' + (tab === 'basic' ? '' : 'display:none;') + '">';
        html += '  <div class="outbound-meta-grid">';
        html += '    <p><label><strong>Unit Name *</strong><br><input type="text" class="widefat outbound-u-field" data-path="name" value="' + escHtml(u.name) + '" placeholder="e.g. Deluxe Room, River View Chalet, Two-Bedroom Lodge..." /></label></p>';
        html += '    <p><label><strong>Unit Type Label (optional)</strong><br><input type="text" class="widefat outbound-u-field" data-path="unitCategory" value="' + escHtml(u.unitCategory) + '" placeholder="Room, Suite, Chalet, Safari Tent, Villa, Entire Home..." /></label></p>';
        html += '    <p><label><strong>Optional Property Wing / Area</strong><br><input type="text" class="widefat outbound-u-field" data-path="wing" value="' + escHtml(u.wing || '') + '" placeholder="e.g. Garden Wing, Pool Wing, Flame Lily Wing, Riverside" /></label></p>';
        html += '    <p><label><strong>Unit Size (m&sup2;, optional)</strong><br><input type="number" step="0.5" min="0" class="widefat outbound-u-field" data-type="number" data-path="sizeSqm" value="' + (u.sizeSqm !== null && u.sizeSqm !== undefined ? escHtml(u.sizeSqm) : '') + '" placeholder="45" /></label></p>';
        html += '    <p><label><strong>Number of Physical Units (optional)</strong><br><input type="number" step="1" min="1" class="widefat outbound-u-field" data-type="int" data-path="unitCount" value="' + (u.unitCount !== null && u.unitCount !== undefined ? escHtml(u.unitCount) : '') + '" placeholder="e.g. 6" /></label></p>';
        html += '    <p><label><strong>Publishing Status</strong><br><select class="widefat outbound-u-field" data-path="status">';
        html += '      <option value="published" ' + (status === 'published' ? 'selected' : '') + '>Published (Active on Site)</option>';
        html += '      <option value="draft" ' + (status === 'draft' ? 'selected' : '') + '>Draft (Hidden from Public)</option>';
        html += '      <option value="archived" ' + (status === 'archived' ? 'selected' : '') + '>Archived</option>';
        html += '    </select></label></p>';
        html += '    <p><label><strong>Availability State</strong><br><select class="widefat outbound-u-field" data-path="availabilityStatus">';
        html += '      <option value="available" ' + (!u.availabilityStatus || u.availabilityStatus === 'available' ? 'selected' : '') + '>Open for Enquiries</option>';
        html += '      <option value="on_request" ' + (u.availabilityStatus === 'on_request' ? 'selected' : '') + '>Available on Request</option>';
        html += '      <option value="temporarily_unavailable" ' + (u.availabilityStatus === 'temporarily_unavailable' ? 'selected' : '') + '>Temporarily Unavailable</option>';
        html += '    </select></label></p>';
        html += '    <p><label><strong>Custom CTA Label (optional)</strong><br><input type="text" class="widefat outbound-u-field" data-path="customCtaLabel" value="' + escHtml(u.customCtaLabel || '') + '" placeholder="Enquire About This Option" /></label></p>';
        html += '    <p style="padding-top:20px;"><label><input type="checkbox" class="outbound-u-field" data-type="bool" data-path="featured" ' + (u.featured ? 'checked' : '') + ' /> <strong>Featured Unit Type</strong></label><br><label style="display:inline-block;margin-top:6px;"><input type="checkbox" class="outbound-u-field" data-type="bool" data-path="isEntireProperty" ' + (u.isEntireProperty ? 'checked' : '') + ' /> <strong>Exclusive-Use Entire Home / Villa</strong></label></p>';
        html += '  </div>';
        html += '  <p><label><strong>Short Description</strong><br><textarea rows="2" class="large-text outbound-u-field" data-path="shortDescription" placeholder="Concise summary shown on the accommodation card...">' + escHtml(u.shortDescription) + '</textarea></label></p>';
        html += '  <p><label><strong>Full Description</strong><br><textarea rows="4" class="large-text outbound-u-field" data-path="description" placeholder="Detailed unit description shown in View Details...">' + escHtml(u.description) + '</textarea></label></p>';
        html += '</div>';

        // B. Occupancy Configuration
        var occ = u.occupancyConfig;
        html += '<div class="outbound-unit-pane" data-pane="occupancy" style="' + (tab === 'occupancy' ? '' : 'display:none;') + '">';
        html += '  <div class="outbound-meta-grid">';
        html += '    <p><label><strong>Max Adults</strong><br><input type="number" min="1" class="widefat outbound-u-field" data-type="int" data-path="occupancyConfig.maxAdults" value="' + (occ.maxAdults !== undefined && occ.maxAdults !== null ? escHtml(occ.maxAdults) : '') + '" /></label></p>';
        html += '    <p><label><strong>Max Children</strong><br><input type="number" min="0" class="widefat outbound-u-field" data-type="int" data-path="occupancyConfig.maxChildren" value="' + (occ.maxChildren !== undefined && occ.maxChildren !== null ? escHtml(occ.maxChildren) : '') + '" /></label></p>';
        html += '    <p><label><strong>Max Total Guests</strong><br><input type="number" min="1" class="widefat outbound-u-field" data-type="int" data-path="occupancyConfig.maxTotalGuests" value="' + (occ.maxTotalGuests !== undefined && occ.maxTotalGuests !== null ? escHtml(occ.maxTotalGuests) : '') + '" /></label></p>';
        html += '    <p><label><strong>Bedrooms (if applicable)</strong><br><input type="number" min="0" class="widefat outbound-u-field" data-type="int" data-path="occupancyConfig.bedrooms" value="' + (occ.bedrooms !== undefined && occ.bedrooms !== null ? escHtml(occ.bedrooms) : '') + '" /></label></p>';
        html += '    <p><label><strong>Bathrooms</strong><br><input type="number" step="0.5" min="0" class="widefat outbound-u-field" data-type="number" data-path="occupancyConfig.bathrooms" value="' + (occ.bathrooms !== undefined && occ.bathrooms !== null ? escHtml(occ.bathrooms) : '') + '" /></label></p>';
        html += '    <p><label><strong>Display Occupancy Label</strong><br><input type="text" class="widefat outbound-u-field" data-path="occupancy" value="' + escHtml(u.occupancy) + '" placeholder="2 Adults + 2 Children" /></label></p>';
        html += '  </div>';
        html += '  <div class="outbound-unit-subbox">';
        html += '    <div class="outbound-subsection-header"><strong>Bed Types &amp; Quantities</strong><button type="button" class="button button-small outbound-u-add-bed">+ Add Bed</button></div>';
        (occ.beds || []).forEach(function (b, bidx) {
          html += '<div class="outbound-u-inline-grid" data-bed-idx="' + bidx + '">';
          html += '  <input type="text" class="regular-text outbound-u-bed-type" value="' + escHtml(b.type) + '" placeholder="e.g. King Bed, Twin Beds, Bunk Bed, Sofa Bed..." />';
          html += '  <input type="number" min="1" class="small-text outbound-u-bed-qty" value="' + escHtml(b.quantity || 1) + '" />';
          html += '  <button type="button" class="button-link-delete outbound-u-del-bed">Remove</button>';
          html += '</div>';
        });
        html += '  </div>';
        html += '  <div class="outbound-meta-grid">';
        html += '    <p><label><input type="checkbox" class="outbound-u-field" data-type="bool" data-path="occupancyConfig.extraBedAvailable" ' + (occ.extraBedAvailable ? 'checked' : '') + ' /> <strong>Extra Bed Available</strong></label><br><input type="text" class="widefat outbound-u-field" data-path="occupancyConfig.extraBedNotes" value="' + escHtml(occ.extraBedNotes) + '" placeholder="e.g. 1 rollaway bed or baby cot on request" style="margin-top:6px;" /></p>';
        html += '    <p><label><strong>Interleading Configurations</strong><br><input type="text" class="widefat outbound-u-field" data-path="occupancyConfig.interleadingInfo" value="' + escHtml(occ.interleadingInfo || '') + '" placeholder="e.g. Interleads with neighbouring Twin Garden Room for families" /></label></p>';
        html += '    <p><label><strong>Child Age Rules</strong><br><input type="text" class="widefat outbound-u-field" data-path="occupancyConfig.childAgePolicy" value="' + escHtml(occ.childAgePolicy) + '" placeholder="Children under 11 at child rate; 11+ at adult rate" /></label></p>';
        html += '    <p><label><strong>Additional Guest Charge Notes</strong><br><input type="text" class="widefat outbound-u-field" data-path="occupancyConfig.additionalGuestChargeNote" value="' + escHtml(occ.additionalGuestChargeNote) + '" placeholder="US$65 per extra adult per night" /></label></p>';
        html += '  </div>';
        html += '</div>';

        // C. Independent Pricing
        var pr = u.pricing;
        var wkDays = pr.weekendDays || ['fri', 'sat'];
        html += '<div class="outbound-unit-pane" data-pane="pricing" style="' + (tab === 'pricing' ? '' : 'display:none;') + '">';
        html += '  <div class="outbound-meta-grid">';
        html += '    <p><label><strong>Base Nightly Price (USD)</strong><br><input type="number" step="0.01" min="0" class="widefat outbound-u-field" data-type="number" data-path="pricing.baseNightlyRateUSD" value="' + (pr.baseNightlyRateUSD !== null && pr.baseNightlyRateUSD !== undefined ? escHtml(pr.baseNightlyRateUSD) : '') + '" placeholder="Leave blank for Price on enquiry" /></label></p>';
        html += '    <p><label><strong>Starting-From Price (USD)</strong><br><input type="number" step="0.01" min="0" class="widefat outbound-u-field" data-type="number" data-path="pricing.startingFromPriceUSD" value="' + (pr.startingFromPriceUSD !== null && pr.startingFromPriceUSD !== undefined ? escHtml(pr.startingFromPriceUSD) : '') + '" placeholder="Lowest advertised nightly rate" /></label></p>';
        html += '    <p><label><strong>Weekend Nightly Rate (USD)</strong><br><input type="number" step="0.01" min="0" class="widefat outbound-u-field" data-type="number" data-path="pricing.weekendRateUSD" value="' + (pr.weekendRateUSD !== null && pr.weekendRateUSD !== undefined ? escHtml(pr.weekendRateUSD) : '') + '" placeholder="Optional weekend rate" /></label></p>';
        html += '    <p><label><strong>Pricing Basis</strong><br><select class="widefat outbound-u-field" data-path="pricing.priceBasis">';
        html += '      <option value="per_room" ' + (pr.priceBasis === 'per_room' ? 'selected' : '') + '>Per Room / Night</option>';
        html += '      <option value="per_unit" ' + (pr.priceBasis === 'per_unit' ? 'selected' : '') + '>Per Unit / Night</option>';
        html += '      <option value="per_lodge" ' + (pr.priceBasis === 'per_lodge' ? 'selected' : '') + '>Per Lodge / Night</option>';
        html += '      <option value="per_villa" ' + (pr.priceBasis === 'per_villa' ? 'selected' : '') + '>Per Villa / Night</option>';
        html += '      <option value="per_bed" ' + (pr.priceBasis === 'per_bed' ? 'selected' : '') + '>Per Bed / Night</option>';
        html += '      <option value="per_campsite" ' + (pr.priceBasis === 'per_campsite' ? 'selected' : '') + '>Per Campsite / Night</option>';
        html += '      <option value="per_person_sharing" ' + (pr.priceBasis === 'per_person_sharing' ? 'selected' : '') + '>Per Person Sharing / Night</option>';
        html += '      <option value="per_person_single" ' + (pr.priceBasis === 'per_person_single' ? 'selected' : '') + '>Per Person Single / Night</option>';
        html += '      <option value="per_person" ' + (pr.priceBasis === 'per_person' ? 'selected' : '') + '>Per Person / Night</option>';
        html += '      <option value="on_request" ' + (pr.priceBasis === 'on_request' ? 'selected' : '') + '>Quote on Request</option>';
        html += '    </select></label></p>';
        html += '    <p><label><strong>Rate Status</strong><br><select class="widefat outbound-u-field" data-path="pricing.rateStatus">';
        html += '      <option value="provisional" ' + (pr.rateStatus !== 'confirmed' ? 'selected' : '') + '>Provisional Guide Rate</option>';
        html += '      <option value="confirmed" ' + (pr.rateStatus === 'confirmed' ? 'selected' : '') + '>Confirmed Published Rate</option>';
        html += '    </select></label></p>';
        html += '    <p><label><strong>Base Occupancy (Adults Included)</strong><br><input type="number" min="1" class="widefat outbound-u-field" data-type="int" data-path="pricing.baseOccupancyAdults" value="' + (pr.baseOccupancyAdults !== null && pr.baseOccupancyAdults !== undefined ? escHtml(pr.baseOccupancyAdults) : '') + '" placeholder="2" /></label></p>';
        html += '    <p><label><strong>Additional Adult Rate (USD/night)</strong><br><input type="number" step="0.01" min="0" class="widefat outbound-u-field" data-type="number" data-path="pricing.additionalGuestRateUSD" value="' + (pr.additionalGuestRateUSD !== null && pr.additionalGuestRateUSD !== undefined ? escHtml(pr.additionalGuestRateUSD) : '') + '" /></label></p>';
        html += '    <p><label><strong>Child Rate Under 11 (USD/night)</strong><br><input type="number" step="0.01" min="0" class="widefat outbound-u-field" data-type="number" data-path="pricing.childRateUSD" value="' + (pr.childRateUSD !== null && pr.childRateUSD !== undefined ? escHtml(pr.childRateUSD) : '') + '" /></label></p>';
        html += '    <p><label><strong>Child Rate 11+ (USD/night)</strong><br><input type="number" step="0.01" min="0" class="widefat outbound-u-field" data-type="number" data-path="pricing.childRate11PlusUSD" value="' + (pr.childRate11PlusUSD !== null && pr.childRate11PlusUSD !== undefined ? escHtml(pr.childRate11PlusUSD) : '') + '" /></label></p>';
        html += '    <p><label><strong>Minimum Stay (Nights)</strong><br><input type="number" min="1" class="widefat outbound-u-field" data-type="int" data-path="pricing.minStayNights" value="' + (pr.minStayNights !== null && pr.minStayNights !== undefined ? escHtml(pr.minStayNights) : '') + '" /></label></p>';
        html += '    <p><label><strong>Rate Valid From</strong><br><input type="date" class="widefat outbound-u-field" data-path="pricing.rateValidFrom" value="' + escHtml(pr.rateValidFrom || '') + '" /></label></p>';
        html += '    <p><label><strong>Rate Valid To</strong><br><input type="date" class="widefat outbound-u-field" data-path="pricing.rateValidTo" value="' + escHtml(pr.rateValidTo || '') + '" /></label></p>';
        html += '  </div>';
        html += '  <p><strong>Weekend Days:</strong> ';
        ['fri', 'sat', 'sun'].forEach(function (d) {
          html += '<label style="margin-right:12px;"><input type="checkbox" class="outbound-u-wkday" value="' + d + '" ' + (wkDays.indexOf(d) !== -1 ? 'checked' : '') + ' /> ' + d.toUpperCase() + '</label>';
        });
        html += '</p>';

        // Seasonal Pricing Repeater
        html += '  <div class="outbound-unit-subbox">';
        html += '    <div class="outbound-subsection-header"><strong>Seasonal Pricing Periods</strong><button type="button" class="button button-small outbound-u-add-season">+ Add Seasonal Rate</button></div>';
        (pr.seasonalRates || []).forEach(function (sr, sidx) {
          var srActive = sr.isActive !== false;
          html += '<div class="outbound-u-subcard ' + (srActive ? '' : 'is-deactivated') + '" data-season-idx="' + sidx + '">';
          html += '  <div class="outbound-u-subcard-top">';
          html += '    <span class="outbound-badge ' + (srActive ? 'outbound-badge-green' : 'outbound-badge-slate') + '">' + (srActive ? 'Active' : 'Deactivated') + '</span>';
          html += '    <div class="outbound-u-subcard-actions">';
          html += '      <button type="button" class="button button-small outbound-u-dup-season">Duplicate</button>';
          html += '      <button type="button" class="button button-small outbound-u-toggle-season">' + (srActive ? 'Deactivate' : 'Activate') + '</button>';
          html += '      <button type="button" class="button-link-delete outbound-u-del-season">Remove</button>';
          html += '    </div>';
          html += '  </div>';
          html += '  <div class="outbound-meta-grid">';
          html += '    <input type="text" class="widefat outbound-u-sr-label" value="' + escHtml(sr.label) + '" placeholder="Season Label (e.g. Peak Dry Season)" />';
          html += '    <input type="date" class="widefat outbound-u-sr-start" value="' + escHtml(sr.startDate) + '" />';
          html += '    <input type="date" class="widefat outbound-u-sr-end" value="' + escHtml(sr.endDate) + '" />';
          html += '    <input type="number" step="0.01" min="0" class="widefat outbound-u-sr-rate" value="' + escHtml(sr.nightlyRateUSD) + '" placeholder="Nightly USD" />';
          html += '    <input type="number" step="0.01" min="0" class="widefat outbound-u-sr-wknd" value="' + (sr.weekendRateUSD !== null && sr.weekendRateUSD !== undefined ? escHtml(sr.weekendRateUSD) : '') + '" placeholder="Weekend USD (opt)" />';
          html += '    <input type="number" min="1" class="widefat outbound-u-sr-min" value="' + (sr.minStayNights !== null && sr.minStayNights !== undefined ? escHtml(sr.minStayNights) : '') + '" placeholder="Min Stay (opt)" />';
          html += '  </div>';
          html += '</div>';
        });
        html += '  </div>';

        // Date-Specific Rates Repeater
        html += '  <div class="outbound-unit-subbox">';
        html += '    <div class="outbound-subsection-header"><strong>Date-Specific Rates (Holidays / Peak Nights)</strong><button type="button" class="button button-small outbound-u-add-daterate">+ Add Date Rate</button></div>';
        (pr.dateSpecificRates || []).forEach(function (dr, didx) {
          var drActive = dr.isActive !== false;
          html += '<div class="outbound-u-inline-grid ' + (drActive ? '' : 'is-deactivated') + '" data-daterate-idx="' + didx + '">';
          html += '  <input type="date" class="outbound-u-dr-date" value="' + escHtml(dr.date) + '" />';
          html += '  <input type="text" class="regular-text outbound-u-dr-label" value="' + escHtml(dr.label || '') + '" placeholder="Label (e.g. Festive Eve)" />';
          html += '  <input type="number" step="0.01" min="0" class="small-text outbound-u-dr-rate" value="' + escHtml(dr.nightlyRateUSD) + '" placeholder="USD" />';
          html += '  <button type="button" class="button button-small outbound-u-dup-daterate">Duplicate</button>';
          html += '  <button type="button" class="button button-small outbound-u-toggle-daterate">' + (drActive ? 'Deactivate' : 'Activate') + '</button>';
          html += '  <button type="button" class="button-link-delete outbound-u-del-daterate">Remove</button>';
          html += '</div>';
        });
        html += '  </div>';

        // Meal-Plan Rates Repeater
        html += '  <div class="outbound-unit-subbox">';
        html += '    <div class="outbound-subsection-header"><strong>Meal-Plan Rate Options</strong><button type="button" class="button button-small outbound-u-add-meal">+ Add Meal Plan</button></div>';
        (pr.mealPlanRates || []).forEach(function (mp, midx) {
          var mpActive = mp.isActive !== false;
          html += '<div class="outbound-u-inline-grid ' + (mpActive ? '' : 'is-deactivated') + '" data-meal-idx="' + midx + '">';
          html += '  <input type="text" class="regular-text outbound-u-mp-name" value="' + escHtml(mp.name) + '" placeholder="e.g. Half Board" />';
          html += '  <input type="number" step="0.01" min="0" class="small-text outbound-u-mp-rate" value="' + escHtml(mp.supplementPerPersonPerNightUSD) + '" placeholder="+$ USD" />';
          html += '  <select class="outbound-u-mp-type"><option value="per_person_per_night" ' + (mp.pricingType !== 'per_unit_per_night' ? 'selected' : '') + '>Per Person / Night</option><option value="per_unit_per_night" ' + (mp.pricingType === 'per_unit_per_night' ? 'selected' : '') + '>Per Unit / Night</option></select>';
          html += '  <input type="text" class="regular-text outbound-u-mp-desc" value="' + escHtml(mp.description || '') + '" placeholder="Notes (optional)" />';
          html += '  <button type="button" class="button button-small outbound-u-dup-meal">Duplicate</button>';
          html += '  <button type="button" class="button button-small outbound-u-toggle-meal">' + (mpActive ? 'Deactivate' : 'Activate') + '</button>';
          html += '  <button type="button" class="button-link-delete outbound-u-del-meal">Remove</button>';
          html += '</div>';
        });
        html += '  </div>';

        html += '  <div class="outbound-meta-grid">';
        html += '    <p><label><strong>Price Inclusions (one per line)</strong><br><textarea rows="3" class="widefat outbound-u-list-field" data-path="pricing.inclusions" placeholder="Daily breakfast&#10;Airport shuttle">' + escHtml((pr.inclusions || []).join('\n')) + '</textarea></label></p>';
        html += '    <p><label><strong>Price Exclusions (one per line)</strong><br><textarea rows="3" class="widefat outbound-u-list-field" data-path="pricing.exclusions" placeholder="Park entry fees&#10;Premium beverages">' + escHtml((pr.exclusions || []).join('\n')) + '</textarea></label></p>';
        html += '  </div>';

        if (canEditInternal) {
          html += '<div class="outbound-unit-internal-box">';
          html += '  <strong>Internal Supplier Rate &amp; Notes (Admin-Only — Hidden From Public Website)</strong>';
          html += '  <div class="outbound-meta-grid" style="margin-top:8px;">';
          html += '    <p><label>Internal Supplier Net Rate / Contract Code<br><input type="text" class="widefat outbound-u-field" data-path="internalSupplierRate" value="' + escHtml(u.internalSupplierRate || '') + '" placeholder="e.g. STO US$195 net / STO-2026" /></label></p>';
          html += '    <p><label>Internal Margin / Booking Notes<br><textarea rows="2" class="widefat outbound-u-field" data-path="internalNotes" placeholder="Confidential supplier terms, commission %, contact desk...">' + escHtml(u.internalNotes || '') + '</textarea></label></p>';
          html += '  </div>';
          html += '</div>';
        }
        html += '</div>';

        // D. Individual Room Gallery
        html += '<div class="outbound-unit-pane" data-pane="gallery" style="' + (tab === 'gallery' ? '' : 'display:none;') + '">';
        html += '  <div class="outbound-unit-subbox">';
        html += '    <strong>Main Room Image</strong>';
        html += '    <div class="outbound-media-field" style="margin-top:8px;">';
        html += '      <div class="outbound-media-preview-box ' + (u.imageUrl ? 'has-image' : '') + '">' + (u.imageUrl ? '<img src="' + escHtml(u.imageUrl) + '" alt="" class="outbound-media-thumb" />' : '<span class="outbound-media-placeholder">No photo</span>') + '</div>';
        html += '      <div class="outbound-media-controls">';
        html += '        <input type="text" class="regular-text outbound-media-input outbound-u-main-img" value="' + escHtml(u.imageUrl) + '" placeholder="https://..." />';
        html += '        <div class="outbound-media-buttons">';
        html += '          <button type="button" class="button outbound-u-pick-main-img">Choose / Replace Main Image</button>';
        html += '          <button type="button" class="button-link-delete outbound-u-clear-main-img">Remove</button>';
        html += '        </div>';
        html += '      </div>';
        html += '    </div>';
        html += '  </div>';

        html += '  <div class="outbound-unit-subbox">';
        html += '    <div class="outbound-subsection-header"><strong>Additional Unit Gallery Photos (Drag to reorder)</strong><div><button type="button" class="button button-secondary outbound-u-gal-multi">+ Add Photos from Media Library</button> <button type="button" class="button outbound-u-gal-add">+ Add Photo Slot</button></div></div>';
        html += '    <p class="description" style="margin:4px 0 8px;">Removing an image here only removes it from this room gallery and never deletes the original file from the WordPress Media Library.</p>';
        html += '    <div class="outbound-u-gal-list">';
        (u.gallery || []).forEach(function (g, gidx) {
          html += '<div class="outbound-gallery-card outbound-u-gal-item" data-gal-idx="' + gidx + '" draggable="true">';
          html += '  <div class="outbound-gallery-card-thumb">' + (g.url ? '<img src="' + escHtml(g.url) + '" alt="" />' : '<span class="outbound-media-placeholder">No photo</span>') + '</div>';
          html += '  <div class="outbound-gallery-card-fields">';
          html += '    <p style="margin:0 0 6px;"><input type="text" class="large-text outbound-u-gal-url" value="' + escHtml(g.url) + '" placeholder="https://..." /></p>';
          html += '    <div class="outbound-meta-grid" style="margin-bottom:6px;">';
          html += '      <input type="text" class="widefat outbound-u-gal-alt" value="' + escHtml(g.alt || '') + '" placeholder="Image alt text" />';
          html += '      <input type="text" class="widefat outbound-u-gal-cap" value="' + escHtml(g.caption || '') + '" placeholder="Image caption (optional)" />';
          html += '    </div>';
          html += '    <div class="outbound-row-controls">';
          if (g.url) {
            html += '      <button type="button" class="button button-small outbound-u-gal-set-main">Set as Main Image</button>';
          }
          html += '      <button type="button" class="button button-small outbound-u-gal-replace">Replace Image</button>';
          html += '      <button type="button" class="button button-small outbound-u-gal-up">&uarr;</button>';
          html += '      <button type="button" class="button button-small outbound-u-gal-down">&darr;</button>';
          html += '      <button type="button" class="button-link-delete outbound-u-gal-remove">Remove</button>';
          html += '    </div>';
          html += '  </div>';
          html += '</div>';
        });
        html += '    </div>';
        html += '  </div>';
        html += '</div>';

        // E. Individual Room Amenities
        html += '<div class="outbound-unit-pane" data-pane="amenities" style="' + (tab === 'amenities' ? '' : 'display:none;') + '">';
        html += '  <p class="description">Select shared room amenities strictly for this unit (removing an amenity here never affects other units or properties).</p>';
        html += '  <div class="outbound-related-grid" style="margin:10px 0 14px;">';
        amenityOptions.forEach(function (am) {
          var checked = (u.amenities || []).indexOf(am.id) !== -1 || (u.amenities || []).indexOf(am.label) !== -1;
          html += '<label class="outbound-related-chip ' + (checked ? 'is-checked' : '') + '">';
          html += '  <input type="checkbox" class="outbound-u-amenity-chk" value="' + escHtml(am.id) + '" ' + (checked ? 'checked' : '') + ' />';
          if (am.icon) html += '<span class="dashicons ' + escHtml(am.icon) + '" style="font-size:15px;width:15px;height:15px;"></span>';
          html += '  <span>' + escHtml(am.label) + '</span>';
          html += '</label>';
        });
        html += '  </div>';
        if ((u.amenities || []).length > 1) {
          var optLabelById = {};
          amenityOptions.forEach(function (o) { optLabelById[o.id] = o.label; });
          html += '  <div class="outbound-unit-subbox">';
          html += '    <strong>Displayed Shared Amenities Order (Move Up / Down)</strong>';
          html += '    <div class="outbound-u-ordered-list" style="margin-top:8px;">';
          (u.amenities || []).forEach(function (aid, aidx) {
            html += '<div class="outbound-u-ordered-row" data-am-idx="' + aidx + '">';
            html += '  <span>' + escHtml(optLabelById[aid] || aid) + '</span>';
            html += '  <span><button type="button" class="button button-small outbound-u-am-up">&uarr;</button> <button type="button" class="button button-small outbound-u-am-down">&darr;</button></span>';
            html += '</div>';
          });
          html += '    </div>';
          html += '  </div>';
        }
        html += '  <div class="outbound-unit-subbox">';
        html += '    <strong>Custom Unit Amenities (Editable &amp; Reorderable)</strong>';
        html += '    <div class="outbound-u-inline-grid" style="margin-top:6px;">';
        html += '      <input type="text" class="regular-text outbound-u-custom-amenity-input" placeholder="e.g. Outdoor copper bathtub, Private plunge deck..." />';
        html += '      <button type="button" class="button outbound-u-add-custom-amenity">+ Add Custom Amenity</button>';
        html += '    </div>';
        html += '    <div class="outbound-u-ordered-list" style="margin-top:8px;">';
        (u.customAmenities || []).forEach(function (ca, cidx) {
          html += '<div class="outbound-u-ordered-row" data-custom-am-idx="' + cidx + '">';
          html += '  <input type="text" class="regular-text outbound-u-custom-am-edit" value="' + escHtml(ca) + '" />';
          html += '  <span><button type="button" class="button button-small outbound-u-cam-up">&uarr;</button> <button type="button" class="button button-small outbound-u-cam-down">&darr;</button> <button type="button" class="button-link-delete outbound-u-del-custom-amenity" data-cidx="' + cidx + '">Remove</button></span>';
          html += '</div>';
        });
        html += '    </div>';
        html += '  </div>';
        html += '  <div class="outbound-unit-subbox">';
        html += '    <strong>Accessibility Features (One per line, optional)</strong>';
        html += '    <textarea rows="2" class="widefat outbound-u-list-field" data-path="accessibilityFeatures" placeholder="Step-free ground floor access&#10;Roll-in shower&#10;Bathroom grab rails" style="margin-top:6px;">' + escHtml((u.accessibilityFeatures || []).join('\n')) + '</textarea>';
        html += '  </div>';
        html += '</div>';

        // F. Extras & Inclusions
        html += '<div class="outbound-unit-pane" data-pane="inclusions" style="' + (tab === 'inclusions' ? '' : 'display:none;') + '">';
        html += '  <p class="description">Toggle standard room-specific extras or add, edit, and reorder custom inclusions.</p>';
        html += '  <div class="outbound-related-grid" style="margin:10px 0 14px;">';
        inclusionPresets.forEach(function (inc) {
          var checked = (u.inclusions || []).indexOf(inc) !== -1;
          html += '<label class="outbound-related-chip ' + (checked ? 'is-checked' : '') + '">';
          html += '  <input type="checkbox" class="outbound-u-inc-chk" value="' + escHtml(inc) + '" ' + (checked ? 'checked' : '') + ' />';
          html += '  <span>' + escHtml(inc) + '</span>';
          html += '</label>';
        });
        html += '  </div>';
        html += '  <div class="outbound-unit-subbox">';
        html += '    <strong>Custom Extras &amp; Inclusions (Editable)</strong>';
        html += '    <div class="outbound-u-inline-grid" style="margin-top:6px;">';
        html += '      <input type="text" class="regular-text outbound-u-custom-inc-input" placeholder="e.g. Sunset river boat transfer included..." />';
        html += '      <button type="button" class="button outbound-u-add-custom-inc">+ Add Custom Inclusion</button>';
        html += '    </div>';
        var customIncs = (u.inclusions || []).filter(function (i) { return inclusionPresets.indexOf(i) === -1; });
        html += '    <div class="outbound-u-ordered-list" style="margin-top:8px;">';
        customIncs.forEach(function (ci) {
          var fullIdx = (u.inclusions || []).indexOf(ci);
          html += '<div class="outbound-u-ordered-row" data-inc-idx="' + fullIdx + '">';
          html += '  <input type="text" class="regular-text outbound-u-custom-inc-edit" data-old-val="' + escHtml(ci) + '" value="' + escHtml(ci) + '" />';
          html += '  <span><button type="button" class="button-link-delete outbound-u-del-custom-inc" data-val="' + escHtml(ci) + '">Remove</button></span>';
          html += '</div>';
        });
        html += '    </div>';
        html += '  </div>';
        html += '</div>';

        // G. Policies & Notes
        var pol = u.policies || {};
        html += '<div class="outbound-unit-pane" data-pane="policies" style="' + (tab === 'policies' ? '' : 'display:none;') + '">';
        html += '  <div class="outbound-meta-grid">';
        html += '    <p><label><strong>Minimum Stay Override (Nights)</strong><br><input type="number" min="1" class="widefat outbound-u-field" data-type="int" data-path="policies.minStayNights" value="' + (pol.minStayNights !== null && pol.minStayNights !== undefined ? escHtml(pol.minStayNights) : '') + '" /></label></p>';
        html += '    <p><label><strong>Check-in Restrictions</strong><br><input type="text" class="widefat outbound-u-field" data-path="policies.checkInRestrictions" value="' + escHtml(pol.checkInRestrictions || '') + '" placeholder="e.g. No check-in after 20:00 without prior notice" /></label></p>';
        html += '    <p><label><strong>Accessibility Information</strong><br><input type="text" class="widefat outbound-u-field" data-path="policies.accessibilityInfo" value="' + escHtml(pol.accessibilityInfo || '') + '" placeholder="Ground floor access / step-free shower..." /></label></p>';
        html += '  </div>';
        html += '  <p><label><strong>Cancellation Conditions</strong><br><textarea rows="2" class="large-text outbound-u-field" data-path="policies.cancellationPolicy">' + escHtml(pol.cancellationPolicy || '') + '</textarea></label></p>';
        html += '  <p><label><strong>Extra-Person Policies</strong><br><textarea rows="2" class="large-text outbound-u-field" data-path="policies.extraPersonPolicy">' + escHtml(pol.extraPersonPolicy || '') + '</textarea></label></p>';
        html += '  <p><label><strong>Other Room-Specific Restrictions / Notes</strong><br><textarea rows="2" class="large-text outbound-u-field" data-path="policies.otherRestrictions">' + escHtml(pol.otherRestrictions || '') + '</textarea></label></p>';
        html += '</div>';

        html += '</div>'; // end body
      }

      html += '</div>'; // end card
      return html;
    }

    function renderUnits() {
      syncHiddenJson();
      var q = $.trim(unitSearchQuery).toLowerCase();
      var visible = [];
      units.forEach(function (u, idx) {
        var st = u.status || 'published';
        var stOk;
        if (unitFilterStatus === 'trashed') stOk = (st === 'trashed');
        else if (unitFilterStatus === 'active') stOk = (st !== 'trashed');
        else stOk = (st === unitFilterStatus);
        if (!stOk) return;
        if (q) {
          var hay = ((u.name || '') + ' ' + (u.unitCategory || '') + ' ' + (u.wing || '') + ' ' + (u.id || '')).toLowerCase();
          if (hay.indexOf(q) === -1) return;
        }
        visible.push(buildUnitCardHtml(u, idx));
      });
      if (!visible.length) {
        var msg = unitFilterStatus === 'trashed'
          ? 'Unit Trash is empty.'
          : (units.length ? 'No accommodation units match the current status or search filter.' : 'No room or accommodation unit types added yet. Click <strong>+ Add Accommodation Unit</strong> above to add your first unit.');
        $list.html('<div class="outbound-empty-box"><p>' + msg + '</p></div>');
        return;
      }
      $list.html(visible.join(''));
    }

    function setByPath(obj, path, val) {
      var parts = path.split('.');
      var cur = obj;
      for (var i = 0; i < parts.length - 1; i++) {
        if (!cur[parts[i]] || typeof cur[parts[i]] !== 'object') cur[parts[i]] = {};
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = val;
    }

    function getUnitFromEl($el) {
      var idx = Number($el.closest('.outbound-unit-card').attr('data-unit-idx'));
      return { idx: idx, unit: units[idx] };
    }

    renderUnits();

    $(document).on('click', '.outbound-u-status-filter', function () {
      $('.outbound-u-status-filter').removeClass('is-active');
      $(this).addClass('is-active');
      unitFilterStatus = String($(this).data('unit-status') || 'active');
      renderUnits();
    });

    $(document).on('input search', '#outbound-unit-search-input', function () {
      unitSearchQuery = String($(this).val() || '');
      renderUnits();
    });

    $('#outbound-add-unit-btn').on('click', function () {
      var u = createEmptyUnit();
      units.push(u);
      expandedIds[u.id] = true;
      activeSubTab[u.id] = 'basic';
      if (unitFilterStatus === 'trashed' || unitFilterStatus === 'published' || unitFilterStatus === 'archived') {
        unitFilterStatus = 'active';
        $('.outbound-u-status-filter').removeClass('is-active').filter('[data-unit-status="active"]').addClass('is-active');
      }
      renderUnits();
    });

    $list.on('click', '.outbound-unit-edit-toggle', function () {
      var ref = getUnitFromEl($(this));
      if (!ref.unit) return;
      expandedIds[ref.unit.id] = !expandedIds[ref.unit.id];
      renderUnits();
    });

    $list.on('click', '.outbound-unit-tab-btn', function () {
      var ref = getUnitFromEl($(this));
      if (!ref.unit) return;
      activeSubTab[ref.unit.id] = $(this).data('tab');
      renderUnits();
    });

    $list.on('click', '.outbound-unit-toggle-status', function () {
      var ref = getUnitFromEl($(this));
      if (!ref.unit) return;
      ref.unit.status = ref.unit.status === 'published' ? 'draft' : 'published';
      renderUnits();
    });

    $list.on('click', '.outbound-unit-archive', function () {
      var ref = getUnitFromEl($(this));
      if (!ref.unit) return;
      ref.unit.status = ref.unit.status === 'archived' ? 'draft' : 'archived';
      renderUnits();
    });

    $list.on('click', '.outbound-unit-toggle-featured', function () {
      var ref = getUnitFromEl($(this));
      if (!ref.unit) return;
      ref.unit.featured = !ref.unit.featured;
      renderUnits();
    });

    $list.on('click', '.outbound-unit-duplicate', function () {
      var ref = getUnitFromEl($(this));
      if (!ref.unit) return;
      var copy = deepClone(ref.unit);
      copy.id = genUnitId('unit_');
      copy.name = (copy.name || 'Unit') + ' (Copy)';
      units.splice(ref.idx + 1, 0, copy);
      expandedIds[copy.id] = true;
      renderUnits();
    });

    $list.on('click', '.outbound-unit-delete', function () {
      var ref = getUnitFromEl($(this));
      if (!ref.unit) return;
      var uname = ref.unit.name || 'this unit';
      outboundConfirmDialog({
        title: 'Move "' + uname + '" to Unit Trash?',
        bodyHtml: '<p>Moving <strong>' + escConfirm(uname) + '</strong> to Trash removes only this room/unit from public display.</p>',
        detailsList: [
          'Parent accommodation property remains unchanged.',
          'All other room & unit types remain untouched.',
          'Room gallery files remain in the WordPress Media Library.'
        ],
        safetyNote: 'You can restore this unit anytime from the Trash tab, or permanently delete it there. Remember to click Update Live / Save as Draft to save changes.',
        confirmLabel: 'Move to Trash',
        confirmClass: 'button-primary',
        onConfirm: function () {
          ref.unit.status = 'trashed';
          delete expandedIds[ref.unit.id];
          renderUnits();
        }
      });
    });

    $list.on('click', '.outbound-unit-restore', function () {
      var ref = getUnitFromEl($(this));
      if (!ref.unit) return;
      ref.unit.status = 'draft';
      renderUnits();
    });

    $list.on('click', '.outbound-unit-restore-publish', function () {
      var ref = getUnitFromEl($(this));
      if (!ref.unit) return;
      ref.unit.status = 'published';
      renderUnits();
    });

    $list.on('click', '.outbound-unit-perm-delete', function () {
      var ref = getUnitFromEl($(this));
      if (!ref.unit) return;
      var uname = ref.unit.name || 'this unit';
      outboundConfirmDialog({
        title: 'Permanently Delete "' + uname + '"?',
        bodyHtml: '<p><strong>Second confirmation required:</strong> Permanently deleting <strong>' + escConfirm(uname) + '</strong> removes only this unit\'s rates, inclusions, and room associations.</p>',
        detailsList: [
          'Parent accommodation property and all other room types are NOT affected.',
          'Shared amenities & Media Library files used elsewhere are NOT deleted.'
        ],
        confirmLabel: 'Delete Unit Permanently',
        confirmClass: 'button-link-delete',
        requireText: 'DELETE',
        onConfirm: function () {
          delete expandedIds[ref.unit.id];
          units.splice(ref.idx, 1);
          renderUnits();
        }
      });
    });

    $list.on('click', '.outbound-unit-move-up', function () {
      var ref = getUnitFromEl($(this));
      if (ref.idx > 0) {
        var tmp = units[ref.idx - 1];
        units[ref.idx - 1] = units[ref.idx];
        units[ref.idx] = tmp;
        renderUnits();
      }
    });

    $list.on('click', '.outbound-unit-move-down', function () {
      var ref = getUnitFromEl($(this));
      if (ref.idx < units.length - 1) {
        var tmp = units[ref.idx + 1];
        units[ref.idx + 1] = units[ref.idx];
        units[ref.idx] = tmp;
        renderUnits();
      }
    });

    // Live field binding without full re-render on keystrokes
    $list.on('input change', '.outbound-u-field', function () {
      var $el = $(this);
      var ref = getUnitFromEl($el);
      if (!ref.unit) return;
      var path = $el.data('path');
      var dtype = $el.data('type');
      var val;
      if (dtype === 'bool') {
        val = $el.is(':checked');
      } else if (dtype === 'int') {
        val = $.trim($el.val()) === '' ? null : parseInt($el.val(), 10);
      } else if (dtype === 'number') {
        val = $.trim($el.val()) === '' ? null : parseFloat($el.val());
      } else {
        val = $el.val();
      }
      setByPath(ref.unit, path, val);
      var $card = $el.closest('.outbound-unit-card');
      if (path === 'name') $card.find('.outbound-unit-card-name').text(val || 'Untitled Unit');
      $card.find('.outbound-unit-price-pill').text(computeStartingPriceLabel(ref.unit));
      $card.find('.outbound-unit-cap-pill').text(computeCapacitySummary(ref.unit));
      syncHiddenJson();
    });

    $list.on('input change', '.outbound-u-list-field', function () {
      var $el = $(this);
      var ref = getUnitFromEl($el);
      if (!ref.unit) return;
      var lines = String($el.val() || '').split(/\r?\n/).map(function (s) { return $.trim(s); }).filter(Boolean);
      setByPath(ref.unit, $el.data('path'), lines);
      syncHiddenJson();
    });

    $list.on('change', '.outbound-u-wkday', function () {
      var $card = $(this).closest('.outbound-unit-card');
      var ref = getUnitFromEl($(this));
      if (!ref.unit) return;
      var days = [];
      $card.find('.outbound-u-wkday:checked').each(function () { days.push($(this).val()); });
      ref.unit.pricing.weekendDays = days;
      syncHiddenJson();
    });

    // Beds repeater
    $list.on('click', '.outbound-u-add-bed', function () {
      var ref = getUnitFromEl($(this));
      if (!ref.unit) return;
      ref.unit.occupancyConfig.beds.push({ type: 'Queen Bed', quantity: 1 });
      renderUnits();
    });
    $list.on('click', '.outbound-u-del-bed', function () {
      var ref = getUnitFromEl($(this));
      var bidx = Number($(this).closest('[data-bed-idx]').attr('data-bed-idx'));
      ref.unit.occupancyConfig.beds.splice(bidx, 1);
      renderUnits();
    });
    $list.on('input change', '.outbound-u-bed-type, .outbound-u-bed-qty', function () {
      var ref = getUnitFromEl($(this));
      var $row = $(this).closest('[data-bed-idx]');
      var bidx = Number($row.attr('data-bed-idx'));
      if (ref.unit.occupancyConfig.beds[bidx]) {
        ref.unit.occupancyConfig.beds[bidx].type = $row.find('.outbound-u-bed-type').val();
        ref.unit.occupancyConfig.beds[bidx].quantity = Math.max(1, parseInt($row.find('.outbound-u-bed-qty').val(), 10) || 1);
        syncHiddenJson();
      }
    });

    // Seasonal rates repeater
    $list.on('click', '.outbound-u-add-season', function () {
      var ref = getUnitFromEl($(this));
      ref.unit.pricing.seasonalRates.push({
        id: genUnitId('sr_'),
        label: 'High Season',
        startDate: '',
        endDate: '',
        nightlyRateUSD: 0,
        weekendRateUSD: null,
        minStayNights: null,
        isActive: true
      });
      renderUnits();
    });
    $list.on('click', '.outbound-u-dup-season', function () {
      var ref = getUnitFromEl($(this));
      var sidx = Number($(this).closest('[data-season-idx]').attr('data-season-idx'));
      var src = ref.unit.pricing.seasonalRates[sidx];
      if (!src) return;
      var copy = deepClone(src);
      copy.id = genUnitId('sr_');
      copy.label = (copy.label || 'Seasonal Rate') + ' (Copy)';
      ref.unit.pricing.seasonalRates.splice(sidx + 1, 0, copy);
      renderUnits();
    });
    $list.on('click', '.outbound-u-toggle-season', function () {
      var ref = getUnitFromEl($(this));
      var sidx = Number($(this).closest('[data-season-idx]').attr('data-season-idx'));
      var sr = ref.unit.pricing.seasonalRates[sidx];
      if (!sr) return;
      sr.isActive = (sr.isActive === false);
      renderUnits();
    });
    $list.on('click', '.outbound-u-del-season', function () {
      var ref = getUnitFromEl($(this));
      var sidx = Number($(this).closest('[data-season-idx]').attr('data-season-idx'));
      var sr = ref.unit.pricing.seasonalRates[sidx];
      outboundConfirmDialog({
        title: 'Remove Seasonal Rate?',
        bodyHtml: '<p>Remove seasonal rate <strong>' + escConfirm((sr && sr.label) || 'Seasonal Period') + '</strong> from ' + escConfirm(ref.unit.name || 'this unit') + '? Tip: you can click Deactivate instead if you want to keep seasonal history without displaying it publicly.</p>',
        confirmLabel: 'Remove Season',
        confirmClass: 'button-link-delete',
        onConfirm: function () {
          ref.unit.pricing.seasonalRates.splice(sidx, 1);
          renderUnits();
        }
      });
    });
    $list.on('input change', '[data-season-idx] input', function () {
      var ref = getUnitFromEl($(this));
      var $row = $(this).closest('[data-season-idx]');
      var sidx = Number($row.attr('data-season-idx'));
      var sr = ref.unit.pricing.seasonalRates[sidx];
      if (!sr) return;
      sr.label = $row.find('.outbound-u-sr-label').val();
      sr.startDate = $row.find('.outbound-u-sr-start').val();
      sr.endDate = $row.find('.outbound-u-sr-end').val();
      sr.nightlyRateUSD = parseFloat($row.find('.outbound-u-sr-rate').val()) || 0;
      var wk = $.trim($row.find('.outbound-u-sr-wknd').val());
      sr.weekendRateUSD = wk === '' ? null : parseFloat(wk);
      var ms = $.trim($row.find('.outbound-u-sr-min').val());
      sr.minStayNights = ms === '' ? null : parseInt(ms, 10);
      syncHiddenJson();
    });

    // Date-specific rates repeater
    $list.on('click', '.outbound-u-add-daterate', function () {
      var ref = getUnitFromEl($(this));
      ref.unit.pricing.dateSpecificRates.push({ id: genUnitId('dr_'), date: '', label: '', nightlyRateUSD: 0, isActive: true });
      renderUnits();
    });
    $list.on('click', '.outbound-u-dup-daterate', function () {
      var ref = getUnitFromEl($(this));
      var didx = Number($(this).closest('[data-daterate-idx]').attr('data-daterate-idx'));
      var src = ref.unit.pricing.dateSpecificRates[didx];
      if (!src) return;
      var copy = deepClone(src);
      copy.id = genUnitId('dr_');
      copy.label = (copy.label || 'Date Rate') + ' (Copy)';
      ref.unit.pricing.dateSpecificRates.splice(didx + 1, 0, copy);
      renderUnits();
    });
    $list.on('click', '.outbound-u-toggle-daterate', function () {
      var ref = getUnitFromEl($(this));
      var didx = Number($(this).closest('[data-daterate-idx]').attr('data-daterate-idx'));
      var dr = ref.unit.pricing.dateSpecificRates[didx];
      if (!dr) return;
      dr.isActive = (dr.isActive === false);
      renderUnits();
    });
    $list.on('click', '.outbound-u-del-daterate', function () {
      var ref = getUnitFromEl($(this));
      var didx = Number($(this).closest('[data-daterate-idx]').attr('data-daterate-idx'));
      var dr = ref.unit.pricing.dateSpecificRates[didx];
      outboundConfirmDialog({
        title: 'Remove Date-Specific Rate?',
        bodyHtml: '<p>Remove date override <strong>' + escConfirm((dr && (dr.label || dr.date)) || 'Date Rate') + '</strong>?</p>',
        confirmLabel: 'Remove Date Rate',
        confirmClass: 'button-link-delete',
        onConfirm: function () {
          ref.unit.pricing.dateSpecificRates.splice(didx, 1);
          renderUnits();
        }
      });
    });
    $list.on('input change', '[data-daterate-idx] input', function () {
      var ref = getUnitFromEl($(this));
      var $row = $(this).closest('[data-daterate-idx]');
      var didx = Number($row.attr('data-daterate-idx'));
      var dr = ref.unit.pricing.dateSpecificRates[didx];
      if (!dr) return;
      dr.date = $row.find('.outbound-u-dr-date').val();
      dr.label = $row.find('.outbound-u-dr-label').val();
      dr.nightlyRateUSD = parseFloat($row.find('.outbound-u-dr-rate').val()) || 0;
      syncHiddenJson();
    });

    // Meal plan repeater
    $list.on('click', '.outbound-u-add-meal', function () {
      var ref = getUnitFromEl($(this));
      ref.unit.pricing.mealPlanRates.push({
        id: genUnitId('mp_'),
        name: 'Half Board',
        supplementPerPersonPerNightUSD: 0,
        pricingType: 'per_person_per_night',
        description: '',
        isActive: true
      });
      renderUnits();
    });
    $list.on('click', '.outbound-u-dup-meal', function () {
      var ref = getUnitFromEl($(this));
      var midx = Number($(this).closest('[data-meal-idx]').attr('data-meal-idx'));
      var src = ref.unit.pricing.mealPlanRates[midx];
      if (!src) return;
      var copy = deepClone(src);
      copy.id = genUnitId('mp_');
      copy.name = (copy.name || 'Meal Plan') + ' (Copy)';
      ref.unit.pricing.mealPlanRates.splice(midx + 1, 0, copy);
      renderUnits();
    });
    $list.on('click', '.outbound-u-toggle-meal', function () {
      var ref = getUnitFromEl($(this));
      var midx = Number($(this).closest('[data-meal-idx]').attr('data-meal-idx'));
      var mp = ref.unit.pricing.mealPlanRates[midx];
      if (!mp) return;
      mp.isActive = (mp.isActive === false);
      renderUnits();
    });
    $list.on('click', '.outbound-u-del-meal', function () {
      var ref = getUnitFromEl($(this));
      var midx = Number($(this).closest('[data-meal-idx]').attr('data-meal-idx'));
      var mp = ref.unit.pricing.mealPlanRates[midx];
      outboundConfirmDialog({
        title: 'Remove Meal-Plan Rate?',
        bodyHtml: '<p>Remove meal plan <strong>' + escConfirm((mp && mp.name) || 'Meal Option') + '</strong> from this unit?</p>',
        confirmLabel: 'Remove Meal Plan',
        confirmClass: 'button-link-delete',
        onConfirm: function () {
          ref.unit.pricing.mealPlanRates.splice(midx, 1);
          renderUnits();
        }
      });
    });
    $list.on('input change', '[data-meal-idx] input, [data-meal-idx] select', function () {
      var ref = getUnitFromEl($(this));
      var $row = $(this).closest('[data-meal-idx]');
      var midx = Number($row.attr('data-meal-idx'));
      var mp = ref.unit.pricing.mealPlanRates[midx];
      if (!mp) return;
      mp.name = $row.find('.outbound-u-mp-name').val();
      mp.supplementPerPersonPerNightUSD = parseFloat($row.find('.outbound-u-mp-rate').val()) || 0;
      mp.pricingType = $row.find('.outbound-u-mp-type').val();
      mp.description = $row.find('.outbound-u-mp-desc').val();
      syncHiddenJson();
    });

    // Main room image & gallery
    $list.on('click', '.outbound-u-pick-main-img', function (e) {
      e.preventDefault();
      var ref = getUnitFromEl($(this));
      if (!ref.unit || typeof wp === 'undefined' || !wp.media) return;
      var frame = wp.media({ title: 'Select Main Room Image', button: { text: 'Use Image' }, multiple: false });
      frame.on('select', function () {
        var att = frame.state().get('selection').first().toJSON();
        if (att && att.url) {
          ref.unit.imageUrl = att.url;
          renderUnits();
        }
      });
      frame.open();
    });
    $list.on('click', '.outbound-u-clear-main-img', function () {
      var ref = getUnitFromEl($(this));
      if (!ref.unit) return;
      ref.unit.imageUrl = '';
      renderUnits();
    });
    $list.on('input', '.outbound-u-main-img', function () {
      var ref = getUnitFromEl($(this));
      if (!ref.unit) return;
      ref.unit.imageUrl = $.trim($(this).val());
      syncHiddenJson();
    });

    $list.on('click', '.outbound-u-gal-multi', function (e) {
      e.preventDefault();
      var ref = getUnitFromEl($(this));
      if (!ref.unit || typeof wp === 'undefined' || !wp.media) return;
      var frame = wp.media({ title: 'Add Room Gallery Photos', button: { text: 'Add Selected Photos' }, multiple: true });
      frame.on('select', function () {
        frame.state().get('selection').toJSON().forEach(function (att) {
          if (att && att.url) {
            ref.unit.gallery.push({
              id: genUnitId('img_'),
              url: att.url,
              alt: att.alt || ref.unit.name,
              caption: att.caption || ''
            });
          }
        });
        renderUnits();
      });
      frame.open();
    });
    $list.on('click', '.outbound-u-gal-add', function () {
      var ref = getUnitFromEl($(this));
      ref.unit.gallery.push({ id: genUnitId('img_'), url: '', alt: '', caption: '' });
      renderUnits();
    });
    $list.on('click', '.outbound-u-gal-set-main', function () {
      var ref = getUnitFromEl($(this));
      var gidx = Number($(this).closest('[data-gal-idx]').attr('data-gal-idx'));
      var chosen = ref.unit.gallery[gidx];
      if (!chosen || !chosen.url) return;
      var prevMain = ref.unit.imageUrl;
      ref.unit.imageUrl = chosen.url;
      ref.unit.gallery.splice(gidx, 1);
      if (prevMain && prevMain !== chosen.url) {
        ref.unit.gallery.unshift({ id: genUnitId('img_'), url: prevMain, alt: ref.unit.name || '', caption: '' });
      }
      renderUnits();
    });
    $list.on('click', '.outbound-u-gal-replace', function (e) {
      e.preventDefault();
      var ref = getUnitFromEl($(this));
      var gidx = Number($(this).closest('[data-gal-idx]').attr('data-gal-idx'));
      if (typeof wp === 'undefined' || !wp.media) return;
      var frame = wp.media({ title: 'Replace Room Photo', button: { text: 'Use Photo' }, multiple: false });
      frame.on('select', function () {
        var att = frame.state().get('selection').first().toJSON();
        if (att && att.url && ref.unit.gallery[gidx]) {
          ref.unit.gallery[gidx].url = att.url;
          if (att.alt && !ref.unit.gallery[gidx].alt) ref.unit.gallery[gidx].alt = att.alt;
          renderUnits();
        }
      });
      frame.open();
    });
    $list.on('click', '.outbound-u-gal-up', function () {
      var ref = getUnitFromEl($(this));
      var gidx = Number($(this).closest('[data-gal-idx]').attr('data-gal-idx'));
      if (gidx > 0) {
        var tmp = ref.unit.gallery[gidx - 1];
        ref.unit.gallery[gidx - 1] = ref.unit.gallery[gidx];
        ref.unit.gallery[gidx] = tmp;
        renderUnits();
      }
    });
    $list.on('click', '.outbound-u-gal-down', function () {
      var ref = getUnitFromEl($(this));
      var gidx = Number($(this).closest('[data-gal-idx]').attr('data-gal-idx'));
      if (gidx < ref.unit.gallery.length - 1) {
        var tmp = ref.unit.gallery[gidx + 1];
        ref.unit.gallery[gidx + 1] = ref.unit.gallery[gidx];
        ref.unit.gallery[gidx] = tmp;
        renderUnits();
      }
    });
    $list.on('click', '.outbound-u-gal-remove', function () {
      var ref = getUnitFromEl($(this));
      var gidx = Number($(this).closest('[data-gal-idx]').attr('data-gal-idx'));
      ref.unit.gallery.splice(gidx, 1);
      renderUnits();
    });
    $list.on('input', '[data-gal-idx] input', function () {
      var ref = getUnitFromEl($(this));
      var $row = $(this).closest('[data-gal-idx]');
      var gidx = Number($row.attr('data-gal-idx'));
      if (!ref.unit.gallery[gidx]) return;
      ref.unit.gallery[gidx].url = $.trim($row.find('.outbound-u-gal-url').val());
      ref.unit.gallery[gidx].alt = $row.find('.outbound-u-gal-alt').val();
      ref.unit.gallery[gidx].caption = $row.find('.outbound-u-gal-cap').val();
      syncHiddenJson();
    });

    // Amenities & custom amenities (preserve selection order + reorderable + editable custom items)
    $list.on('change', '.outbound-u-amenity-chk', function () {
      var ref = getUnitFromEl($(this));
      var val = String($(this).val());
      var cur = Array.isArray(ref.unit.amenities) ? ref.unit.amenities.slice() : [];
      if ($(this).is(':checked')) {
        if (cur.indexOf(val) === -1) cur.push(val);
      } else {
        cur = cur.filter(function (item) { return item !== val; });
      }
      ref.unit.amenities = cur;
      renderUnits();
    });
    $list.on('click', '.outbound-u-am-up', function () {
      var ref = getUnitFromEl($(this));
      var aidx = Number($(this).closest('[data-am-idx]').attr('data-am-idx'));
      if (aidx > 0 && ref.unit.amenities[aidx]) {
        var tmp = ref.unit.amenities[aidx - 1];
        ref.unit.amenities[aidx - 1] = ref.unit.amenities[aidx];
        ref.unit.amenities[aidx] = tmp;
        renderUnits();
      }
    });
    $list.on('click', '.outbound-u-am-down', function () {
      var ref = getUnitFromEl($(this));
      var aidx = Number($(this).closest('[data-am-idx]').attr('data-am-idx'));
      if (aidx < ref.unit.amenities.length - 1) {
        var tmp = ref.unit.amenities[aidx + 1];
        ref.unit.amenities[aidx + 1] = ref.unit.amenities[aidx];
        ref.unit.amenities[aidx] = tmp;
        renderUnits();
      }
    });
    $list.on('click', '.outbound-u-add-custom-amenity', function () {
      var ref = getUnitFromEl($(this));
      var $inp = $(this).siblings('.outbound-u-custom-amenity-input');
      var v = $.trim($inp.val());
      if (!v) return;
      if (ref.unit.customAmenities.indexOf(v) === -1) ref.unit.customAmenities.push(v);
      renderUnits();
    });
    $list.on('input change', '.outbound-u-custom-am-edit', function () {
      var ref = getUnitFromEl($(this));
      var cidx = Number($(this).closest('[data-custom-am-idx]').attr('data-custom-am-idx'));
      if (ref.unit.customAmenities[cidx] === undefined) return;
      ref.unit.customAmenities[cidx] = $.trim($(this).val());
      syncHiddenJson();
    });
    $list.on('click', '.outbound-u-cam-up', function () {
      var ref = getUnitFromEl($(this));
      var cidx = Number($(this).closest('[data-custom-am-idx]').attr('data-custom-am-idx'));
      if (cidx > 0) {
        var tmp = ref.unit.customAmenities[cidx - 1];
        ref.unit.customAmenities[cidx - 1] = ref.unit.customAmenities[cidx];
        ref.unit.customAmenities[cidx] = tmp;
        renderUnits();
      }
    });
    $list.on('click', '.outbound-u-cam-down', function () {
      var ref = getUnitFromEl($(this));
      var cidx = Number($(this).closest('[data-custom-am-idx]').attr('data-custom-am-idx'));
      if (cidx < ref.unit.customAmenities.length - 1) {
        var tmp = ref.unit.customAmenities[cidx + 1];
        ref.unit.customAmenities[cidx + 1] = ref.unit.customAmenities[cidx];
        ref.unit.customAmenities[cidx] = tmp;
        renderUnits();
      }
    });
    $list.on('click', '.outbound-u-del-custom-amenity', function () {
      var ref = getUnitFromEl($(this));
      var cidx = Number($(this).attr('data-cidx'));
      ref.unit.customAmenities.splice(cidx, 1);
      renderUnits();
    });

    // Inclusions & custom inclusions
    $list.on('change', '.outbound-u-inc-chk', function () {
      var ref = getUnitFromEl($(this));
      var val = $(this).val();
      if ($(this).is(':checked')) {
        if (ref.unit.inclusions.indexOf(val) === -1) ref.unit.inclusions.push(val);
      } else {
        ref.unit.inclusions = ref.unit.inclusions.filter(function (i) { return i !== val; });
      }
      syncHiddenJson();
    });
    $list.on('click', '.outbound-u-add-custom-inc', function () {
      var ref = getUnitFromEl($(this));
      var $inp = $(this).siblings('.outbound-u-custom-inc-input');
      var v = $.trim($inp.val());
      if (!v) return;
      if (ref.unit.inclusions.indexOf(v) === -1) ref.unit.inclusions.push(v);
      renderUnits();
    });
    $list.on('input change', '.outbound-u-custom-inc-edit', function () {
      var ref = getUnitFromEl($(this));
      var idx = Number($(this).closest('[data-inc-idx]').attr('data-inc-idx'));
      var nextVal = $.trim($(this).val());
      if (idx >= 0 && ref.unit.inclusions[idx] !== undefined && nextVal !== '') {
        ref.unit.inclusions[idx] = nextVal;
        syncHiddenJson();
      }
    });
    $list.on('click', '.outbound-u-del-custom-inc', function () {
      var ref = getUnitFromEl($(this));
      var val = $(this).attr('data-val');
      ref.unit.inclusions = ref.unit.inclusions.filter(function (i) { return i !== val; });
      renderUnits();
    });
    $list.on('keydown', '.outbound-u-custom-amenity-input, .outbound-u-custom-inc-input', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        $(this).siblings('button').trigger('click');
      }
    });

    // Drag and Drop reordering for Unit Cards & Unit Gallery items
    $list.on('dragstart', '.outbound-u-gal-item', function (e) {
      e.stopPropagation();
      var ref = getUnitFromEl($(this));
      dragPhotoState = { unitIdx: ref.idx, galIdx: Number($(this).attr('data-gal-idx')) };
      $(this).addClass('is-dragging');
    });
    $list.on('dragend', '.outbound-u-gal-item', function () {
      $(this).removeClass('is-dragging');
      dragPhotoState = null;
    });
    $list.on('dragover', '.outbound-u-gal-item', function (e) {
      if (dragPhotoState) {
        e.preventDefault();
        e.stopPropagation();
      }
    });
    $list.on('drop', '.outbound-u-gal-item', function (e) {
      if (!dragPhotoState) return;
      e.preventDefault();
      e.stopPropagation();
      var ref = getUnitFromEl($(this));
      var targetIdx = Number($(this).attr('data-gal-idx'));
      if (ref.idx === dragPhotoState.unitIdx && targetIdx !== dragPhotoState.galIdx) {
        var arr = ref.unit.gallery;
        var moved = arr.splice(dragPhotoState.galIdx, 1)[0];
        arr.splice(targetIdx, 0, moved);
        renderUnits();
      }
      dragPhotoState = null;
    });

    $list.on('dragstart', '.outbound-unit-card', function (e) {
      if (dragPhotoState) return;
      if ($(e.target).is('input, textarea, select, button')) {
        e.preventDefault();
        return;
      }
      dragUnitIdx = Number($(this).attr('data-unit-idx'));
      $(this).addClass('is-dragging');
    });
    $list.on('dragend', '.outbound-unit-card', function () {
      $(this).removeClass('is-dragging');
      dragUnitIdx = null;
    });
    $list.on('dragover', '.outbound-unit-card', function (e) {
      if (dragUnitIdx !== null) e.preventDefault();
    });
    $list.on('drop', '.outbound-unit-card', function (e) {
      if (dragUnitIdx === null) return;
      e.preventDefault();
      var targetIdx = Number($(this).attr('data-unit-idx'));
      if (!isNaN(targetIdx) && targetIdx !== dragUnitIdx) {
        var moved = units.splice(dragUnitIdx, 1)[0];
        units.splice(targetIdx, 0, moved);
        renderUnits();
      }
      dragUnitIdx = null;
    });

    // Ensure hidden JSON is fresh on any form submit & also before Gutenberg saves meta boxes
    $jsonInput.closest('form').on('submit', function () {
      syncHiddenJson();
    });
    $(document).on('mousedown click', '.editor-post-publish-button, .editor-post-publish-panel__toggle, .editor-post-save-draft', function () {
      syncHiddenJson();
    });
    window.__outboundGetEditorUnits = function () { return units; };
  }

  function initPropertyTabs() {
    var $shell = $('#outbound-prop-editor-shell');
    if (!$shell.length || $shell.data('tabs-bound')) return;
    $shell.data('tabs-bound', true);

    $shell.on('click', '.outbound-prop-tab-btn', function () {
      var target = $(this).data('prop-tab');
      if (!target) return;
      $shell.find('.outbound-prop-tab-btn').removeClass('is-active');
      $(this).addClass('is-active');
      $shell.find('.outbound-prop-tab-pane').hide().removeClass('is-active');
      $shell.find('[data-prop-pane="' + target + '"]').show().addClass('is-active');
      $(document).trigger('outbound:propTabChanged', [target]);
    });

    // Keep Indicative Starting Rate & Unit Label synced between Tab 1 (Property Details) and Tab 3 (Rates & Seasons).
    function bindMirroredInput(primarySel, mirrorSel) {
      var $primary = $shell.find(primarySel);
      var $mirror = $shell.find(mirrorSel);
      if (!$primary.length || !$mirror.length) return;
      $primary.on('input change', function () {
        if ($mirror.val() !== $primary.val()) $mirror.val($primary.val());
      });
      $mirror.on('input change', function () {
        if ($primary.val() !== $mirror.val()) $primary.val($mirror.val()).trigger('change');
      });
    }
    bindMirroredInput('#outbound_indicative_price_usd', '#outbound_indicative_price_usd_mirror');
    bindMirroredInput('#outbound_indicative_price_unit', '#outbound_indicative_price_unit_mirror');
  }

  function initRatePlanManager() {
    var $cfgEl = $('#outbound-unit-manager-config');
    var $list = $('#outbound-rate-plan-manager-list');
    var $jsonInput = $('#outbound_rate_plans_json_input');
    if (!$cfgEl.length || !$list.length || !$jsonInput.length || $list.data('outbound-rp-init')) return;
    $list.data('outbound-rp-init', true);

    var cfg;
    try { cfg = JSON.parse($cfgEl.text() || '{}'); } catch (_e) { cfg = {}; }
    var canEditInternal = Boolean(cfg.canEditInternal);
    var sharedRateTemplates = Array.isArray(cfg.sharedRateTemplates) ? cfg.sharedRateTemplates : [];
    var ratePlans = (Array.isArray(cfg.ratePlans) ? cfg.ratePlans : []).map(function (rp) {
      return $.extend({
        id: genUnitId('rp_'),
        internalRateName: '',
        validFrom: '',
        validTo: '',
        amountUSD: null,
        priceBasis: 'per_room',
        customBasisLabel: '',
        visitorMarket: 'international',
        customMarketLabel: '',
        adultOrChildCategory: 'all',
        boardBasis: 'bed_and_breakfast',
        maxOccupancy: null,
        minStayNights: null,
        inclusions: [],
        exclusions: [],
        rateStatus: 'provisional',
        isActive: true,
        lastConfirmedDate: '',
        applicableUnitIds: [],
        supplierCostUSD: null,
        internalNotes: ''
      }, rp || {});
    });

    function syncRpJson() {
      $jsonInput.val(JSON.stringify(ratePlans));
      $('#outbound-rp-count-badge').text(ratePlans.length);
    }

    function getAvailableUnits() {
      return typeof window.__outboundGetEditorUnits === 'function' ? window.__outboundGetEditorUnits() : (cfg.units || []);
    }

    function renderRatePlans() {
      syncRpJson();
      if (!ratePlans.length) {
        $list.html('<div class="outbound-empty-box"><p>No property-level rate plans defined yet. Click <strong>+ Add Rate Plan</strong> to create seasonal, Zimbabwe/SADC/International visitor market, or multi-unit rate tariffs.</p></div>');
        return;
      }
      var unitsList = getAvailableUnits();
      var html = ratePlans.map(function (rp, idx) {
        var rpActive = rp.isActive !== false;
        var card = '<div class="outbound-unit-card ' + (rpActive ? '' : 'is-deactivated') + '" data-rp-idx="' + idx + '">';
        card += '<div class="outbound-unit-card-header">';
        card += '  <div class="outbound-unit-header-left">';
        card += '    <div class="outbound-unit-meta">';
        card += '      <div class="outbound-unit-title-row"><strong>' + escHtml(rp.internalRateName || 'Untitled Rate Plan') + '</strong> <span class="outbound-unit-cat-pill">' + escHtml((rp.visitorMarket || 'international').replace(/_/g, ' ')) + '</span> <span class="outbound-badge ' + (rp.rateStatus === 'confirmed' ? 'outbound-badge-green' : 'outbound-badge-amber') + '">' + escHtml(rp.rateStatus || 'provisional') + '</span> <span class="outbound-badge ' + (rpActive ? 'outbound-badge-green' : 'outbound-badge-slate') + '">' + (rpActive ? 'Active' : 'Deactivated') + '</span></div>';
        card += '      <div class="outbound-unit-sub-row"><span class="outbound-unit-price-pill">' + (rp.amountUSD ? ('US$' + Number(rp.amountUSD)) : 'Price on enquiry') + '</span><span>&middot;</span><span>' + escHtml((rp.priceBasis || 'per_room').replace(/_/g, ' ')) + '</span>' + (rp.validFrom || rp.validTo ? ('<span>&middot;</span><span>' + escHtml(rp.validFrom || '...') + ' to ' + escHtml(rp.validTo || '...') + '</span>') : '') + '</div>';
        card += '    </div>';
        card += '  </div>';
        card += '  <div class="outbound-unit-header-actions"><button type="button" class="button button-small outbound-rp-toggle-active">' + (rpActive ? 'Deactivate' : 'Activate') + '</button> <button type="button" class="button button-small outbound-rp-duplicate">Duplicate</button> <button type="button" class="button-link-delete outbound-rp-delete">Delete</button></div>';
        card += '</div>';
        card += '<div class="outbound-unit-card-body">';
        card += '  <div class="outbound-meta-grid">';
        card += '    <p><label><strong>Internal Rate Name *</strong><br><input type="text" class="widefat outbound-rp-field" data-path="internalRateName" value="' + escHtml(rp.internalRateName) + '" placeholder="e.g. 2026 Dry Season International B&amp;B" /></label></p>';
        card += '    <p><label><strong>Public Selling Price (USD)</strong><br><input type="number" step="0.01" min="0" class="widefat outbound-rp-field" data-type="number" data-path="amountUSD" value="' + (rp.amountUSD !== null && rp.amountUSD !== undefined ? escHtml(rp.amountUSD) : '') + '" /></label></p>';
        card += '    <p><label><strong>Price Basis</strong><br><select class="widefat outbound-rp-field" data-path="priceBasis">';
        [['per_person_sharing','Per Person Sharing'],['per_person_single','Per Person Single'],['per_room','Per Room / Night'],['per_unit','Per Unit (Whole Villa/Lodge)'],['custom','Custom Basis']].forEach(function (opt) {
          card += '<option value="' + opt[0] + '" ' + (rp.priceBasis === opt[0] ? 'selected' : '') + '>' + opt[1] + '</option>';
        });
        card += '    </select></label></p>';
        card += '    <p><label><strong>Visitor Market</strong><br><select class="widefat outbound-rp-field" data-path="visitorMarket">';
        [['international','International Visitor'],['zimbabwe_resident','Zimbabwe Resident'],['sadc_resident','SADC Resident'],['custom','Custom Market']].forEach(function (opt) {
          card += '<option value="' + opt[0] + '" ' + (rp.visitorMarket === opt[0] ? 'selected' : '') + '>' + opt[1] + '</option>';
        });
        card += '    </select></label></p>';
        card += '    <p><label><strong>Board / Meal Basis</strong><br><select class="widefat outbound-rp-field" data-path="boardBasis">';
        [['room_only','Room Only'],['self_catering','Self-Catering'],['bed_and_breakfast','Bed &amp; Breakfast Included'],['half_board','Half Board'],['full_board','Full Board'],['all_inclusive','Fully Inclusive']].forEach(function (opt) {
          card += '<option value="' + opt[0] + '" ' + (rp.boardBasis === opt[0] ? 'selected' : '') + '>' + opt[1] + '</option>';
        });
        card += '    </select></label></p>';
        card += '    <p><label><strong>Guest Category</strong><br><select class="widefat outbound-rp-field" data-path="adultOrChildCategory">';
        [['all','All Guests (Standard)'],['adult','Adults Only'],['child','Children Only']].forEach(function (opt) {
          card += '<option value="' + opt[0] + '" ' + (rp.adultOrChildCategory === opt[0] ? 'selected' : '') + '>' + opt[1] + '</option>';
        });
        card += '    </select></label></p>';
        card += '    <p><label><strong>Valid From</strong><br><input type="date" class="widefat outbound-rp-field" data-path="validFrom" value="' + escHtml(rp.validFrom || '') + '" /></label></p>';
        card += '    <p><label><strong>Valid To</strong><br><input type="date" class="widefat outbound-rp-field" data-path="validTo" value="' + escHtml(rp.validTo || '') + '" /></label></p>';
        card += '    <p><label><strong>Min Stay (Nights)</strong><br><input type="number" min="1" class="widefat outbound-rp-field" data-type="int" data-path="minStayNights" value="' + (rp.minStayNights !== null && rp.minStayNights !== undefined ? escHtml(rp.minStayNights) : '') + '" /></label></p>';
        card += '    <p><label><strong>Max Occupancy</strong><br><input type="number" min="1" class="widefat outbound-rp-field" data-type="int" data-path="maxOccupancy" value="' + (rp.maxOccupancy !== null && rp.maxOccupancy !== undefined ? escHtml(rp.maxOccupancy) : '') + '" /></label></p>';
        card += '    <p><label><strong>Rate Status</strong><br><select class="widefat outbound-rp-field" data-path="rateStatus"><option value="provisional" ' + (rp.rateStatus !== 'confirmed' ? 'selected' : '') + '>Provisional Guide Rate</option><option value="confirmed" ' + (rp.rateStatus === 'confirmed' ? 'selected' : '') + '>Confirmed Rate</option></select></label></p>';
        card += '    <p><label><strong>Last Confirmed Date</strong><br><input type="date" class="widefat outbound-rp-field" data-path="lastConfirmedDate" value="' + escHtml(rp.lastConfirmedDate || '') + '" /></label></p>';
        card += '  </div>';
        if (unitsList.length) {
          card += '<p style="margin:8px 0 4px;"><strong>Applicable Accommodation Units:</strong></p><div class="outbound-related-grid">';
          unitsList.forEach(function (u) {
            var isLinked = (rp.applicableUnitIds || []).indexOf(u.id) !== -1;
            card += '<label class="outbound-related-chip ' + (isLinked ? 'is-checked' : '') + '"><input type="checkbox" class="outbound-rp-unit-chk" value="' + escHtml(u.id) + '" ' + (isLinked ? 'checked' : '') + ' /> <span>' + escHtml(u.name || u.id) + '</span></label>';
          });
          card += '</div>';
        }
        card += '  <div class="outbound-meta-grid" style="margin-top:8px;">';
        card += '    <p><label><strong>Inclusions (one per line)</strong><br><textarea rows="2" class="widefat outbound-rp-list-field" data-path="inclusions">' + escHtml((rp.inclusions || []).join('\n')) + '</textarea></label></p>';
        card += '    <p><label><strong>Exclusions (one per line)</strong><br><textarea rows="2" class="widefat outbound-rp-list-field" data-path="exclusions">' + escHtml((rp.exclusions || []).join('\n')) + '</textarea></label></p>';
        card += '  </div>';
        if (canEditInternal) {
          card += '<div class="outbound-unit-internal-box"><strong>Admin-Only Supplier Cost &amp; Margin Notes (Never Exposed Publicly)</strong><div class="outbound-meta-grid" style="margin-top:6px;">';
          card += '  <p><label>Supplier Net Cost (USD)<br><input type="number" step="0.01" min="0" class="widefat outbound-rp-field" data-type="number" data-path="supplierCostUSD" value="' + (rp.supplierCostUSD !== null && rp.supplierCostUSD !== undefined ? escHtml(rp.supplierCostUSD) : '') + '" /></label></p>';
          card += '  <p><label>Internal Rate Notes<br><textarea rows="2" class="widefat outbound-rp-field" data-path="internalNotes">' + escHtml(rp.internalNotes || '') + '</textarea></label></p>';
          card += '</div></div>';
        }
        card += '</div></div>';
        return card;
      }).join('');
      $list.html(html);
    }

    renderRatePlans();
    $(document).on('outbound:propTabChanged', function (_e, tab) { if (tab === 'rates') renderRatePlans(); });
    $('#outbound-add-rate-plan-btn').on('click', function () {
      ratePlans.push({
        id: genUnitId('rp_'), internalRateName: 'New Rate Plan', validFrom: '', validTo: '',
        amountUSD: null, priceBasis: 'per_room', visitorMarket: 'international',
        adultOrChildCategory: 'all', boardBasis: 'bed_and_breakfast', maxOccupancy: null,
        minStayNights: null, inclusions: [], exclusions: [], rateStatus: 'provisional', isActive: true,
        lastConfirmedDate: '', applicableUnitIds: [], supplierCostUSD: null, internalNotes: ''
      });
      renderRatePlans();
    });
    $('#outbound-rp-import-template-btn').on('click', function () {
      var tplId = String($('#outbound-rp-shared-template-select').val() || '');
      if (!tplId) return;
      var tplList = sharedRateTemplates;
      if (!tplList.length) {
        try { tplList = JSON.parse($('#outbound-shared-rate-templates-config').text() || '[]'); } catch (_e) { tplList = []; }
      }
      var tpl = tplList.filter(function (item) { return item && item.id === tplId; })[0];
      if (!tpl) return;
      var boardMap = { 'room-only': 'room_only', 'bed-breakfast': 'bed_and_breakfast', 'half-board': 'half_board', 'full-board': 'full_board', 'all-inclusive': 'all_inclusive' };
      ratePlans.push({
        id: genUnitId('rp_'),
        internalRateName: tpl.name || 'Imported Rate Plan',
        validFrom: tpl.startDate || '',
        validTo: tpl.endDate || '',
        amountUSD: tpl.nightlyRate !== undefined ? Number(tpl.nightlyRate) : null,
        priceBasis: 'per_room',
        visitorMarket: 'international',
        adultOrChildCategory: 'all',
        boardBasis: boardMap[tpl.boardType] || 'bed_and_breakfast',
        maxOccupancy: null,
        minStayNights: null,
        inclusions: Array.isArray(tpl.inclusions) ? tpl.inclusions.slice() : [],
        exclusions: [],
        rateStatus: 'confirmed',
        isActive: true,
        lastConfirmedDate: '',
        applicableUnitIds: [],
        supplierCostUSD: null,
        internalNotes: tpl.discountLabel ? ('Imported from Shared Template (' + tpl.discountLabel + ')') : 'Imported from Shared Template'
      });
      renderRatePlans();
    });
    $list.on('click', '.outbound-rp-toggle-active', function () {
      var idx = Number($(this).closest('[data-rp-idx]').attr('data-rp-idx'));
      if (!ratePlans[idx]) return;
      ratePlans[idx].isActive = (ratePlans[idx].isActive === false);
      renderRatePlans();
    });
    $list.on('click', '.outbound-rp-duplicate', function () {
      var idx = Number($(this).closest('[data-rp-idx]').attr('data-rp-idx'));
      var copy = deepClone(ratePlans[idx]);
      copy.id = genUnitId('rp_');
      copy.internalRateName = (copy.internalRateName || 'Rate Plan') + ' (Copy)';
      ratePlans.splice(idx + 1, 0, copy);
      renderRatePlans();
    });
    $list.on('click', '.outbound-rp-delete', function () {
      var idx = Number($(this).closest('[data-rp-idx]').attr('data-rp-idx'));
      var rp = ratePlans[idx];
      if (!rp) return;
      var linkedCount = Array.isArray(rp.applicableUnitIds) ? rp.applicableUnitIds.length : 0;
      outboundConfirmDialog({
        title: 'Delete Rate Plan "' + (rp.internalRateName || 'Untitled Rate') + '"?',
        bodyHtml: '<p>Removing this rate plan deletes it only from this property. ' + (linkedCount ? ('It is currently linked to <strong>' + linkedCount + '</strong> unit(s). ') : '') + 'Tip: click <strong>Deactivate</strong> if you want to hide the rate publicly without deleting historical tariff data.</p>',
        safetyNote: 'Deleting a property rate plan does not delete any shared Rate Template in the Shared Library.',
        confirmLabel: 'Delete Rate Plan',
        confirmClass: 'button-link-delete',
        onConfirm: function () {
          ratePlans.splice(idx, 1);
          renderRatePlans();
        }
      });
    });
    $list.on('input change', '.outbound-rp-field', function () {
      var idx = Number($(this).closest('[data-rp-idx]').attr('data-rp-idx'));
      var rp = ratePlans[idx];
      if (!rp) return;
      var path = $(this).data('path');
      var dtype = $(this).data('type');
      var val = $(this).val();
      if (dtype === 'number') val = $.trim(val) === '' ? null : Number(val);
      else if (dtype === 'int') val = $.trim(val) === '' ? null : parseInt(val, 10);
      rp[path] = val;
      syncRpJson();
    });
    $list.on('input', '.outbound-rp-list-field', function () {
      var idx = Number($(this).closest('[data-rp-idx]').attr('data-rp-idx'));
      var rp = ratePlans[idx];
      if (!rp) return;
      rp[$(this).data('path')] = String($(this).val() || '').split(/\r?\n/).map($.trim).filter(Boolean);
      syncRpJson();
    });
    $list.on('change', '.outbound-rp-unit-chk', function () {
      var idx = Number($(this).closest('[data-rp-idx]').attr('data-rp-idx'));
      var rp = ratePlans[idx];
      if (!rp) return;
      var vals = [];
      $(this).closest('.outbound-unit-card').find('.outbound-rp-unit-chk:checked').each(function () { vals.push($(this).val()); });
      rp.applicableUnitIds = vals;
      syncRpJson();
    });
    $jsonInput.closest('form').on('submit', syncRpJson);
    $(document).on('mousedown click', '.editor-post-publish-button, .editor-post-publish-panel__toggle, .editor-post-save-draft', syncRpJson);
  }

  function initOfferManager() {
    var $cfgEl = $('#outbound-unit-manager-config');
    var $list = $('#outbound-offer-manager-list');
    var $jsonInput = $('#outbound_offers_json_input');
    if (!$cfgEl.length || !$list.length || !$jsonInput.length || $list.data('outbound-offer-init')) return;
    $list.data('outbound-offer-init', true);

    var cfg;
    try { cfg = JSON.parse($cfgEl.text() || '{}'); } catch (_e) { cfg = {}; }
    var sharedOfferTemplates = Array.isArray(cfg.sharedOfferTemplates) ? cfg.sharedOfferTemplates : [];
    var offers = (Array.isArray(cfg.offers) ? cfg.offers : []).map(function (off) {
      return $.extend({
        id: genUnitId('offer_'),
        title: '',
        description: '',
        galleryImages: [],
        includedServices: [],
        applicableUnitIds: [],
        applyToEntireProperty: false,
        validFrom: '',
        validTo: '',
        offerCategory: 'special_offer',
        priceType: 'added_value',
        offerPriceUSD: null,
        discountPercent: null,
        discountAmountUSD: null,
        guestRequirements: '',
        conditions: '',
        status: 'published',
        ctaLabel: 'Enquire About This Offer',
        featured: false
      }, off || {});
    });

    function syncOffersJson() {
      $jsonInput.val(JSON.stringify(offers));
      $('#outbound-offer-count-badge').text(offers.filter(function (o) { return o.status !== 'trashed'; }).length);
    }

    function getAvailableUnits() {
      return typeof window.__outboundGetEditorUnits === 'function' ? window.__outboundGetEditorUnits() : (cfg.units || []);
    }

    function renderOffers() {
      syncOffersJson();
      if (!offers.length) {
        $list.html('<div class="outbound-empty-box"><p>No property special offers created yet. Click <strong>+ Add Special Offer</strong> to attach a Romantic Getaway, Stay Longer deal, or honeymoon package to existing room types without duplicating rooms.</p></div>');
        return;
      }
      var unitsList = getAvailableUnits();
      var html = offers.map(function (off, idx) {
        var st = off.status || 'published';
        var stBadge = st === 'published' ? 'outbound-badge-green' : (st === 'archived' ? 'outbound-badge-slate' : (st === 'trashed' ? 'outbound-badge-red' : 'outbound-badge-amber'));
        var card = '<div class="outbound-unit-card ' + (st === 'trashed' ? 'is-trashed' : '') + '" data-offer-idx="' + idx + '">';
        card += '<div class="outbound-unit-card-header">';
        card += '  <div class="outbound-unit-header-left"><div class="outbound-unit-meta">';
        card += '    <div class="outbound-unit-title-row"><strong>' + escHtml(off.title || 'Untitled Offer') + '</strong> <span class="outbound-unit-cat-pill">' + escHtml((off.offerCategory || 'special-offer').replace(/-/g, ' ')) + '</span> <span class="outbound-badge ' + stBadge + '">' + escHtml(st) + '</span></div>';
        card += '    <div class="outbound-unit-sub-row"><span>' + escHtml((off.priceType || 'added_value').replace(/_/g, ' ')) + '</span>' + (off.offerPriceUSD ? ('<span>&middot;</span><span class="outbound-unit-price-pill">US$' + Number(off.offerPriceUSD) + '</span>') : '') + '</div>';
        card += '  </div></div>';
        card += '  <div class="outbound-unit-header-actions">';
        if (st === 'trashed') {
          card += '    <button type="button" class="button button-small outbound-offer-restore">Restore to Draft</button>';
          card += '    <button type="button" class="button-link-delete outbound-offer-perm-delete">Delete Forever</button>';
        } else {
          card += '    <button type="button" class="button button-small outbound-offer-archive">' + (st === 'archived' ? 'Restore' : 'Archive') + '</button>';
          card += '    <button type="button" class="button button-small outbound-offer-duplicate">Duplicate</button>';
          card += '    <button type="button" class="button-link-delete outbound-offer-delete">Move to Trash</button>';
        }
        card += '  </div>';
        card += '</div>';
        card += '<div class="outbound-unit-card-body">';
        card += '  <div class="outbound-meta-grid">';
        card += '    <p><label><strong>Offer / Package Title *</strong><br><input type="text" class="widefat outbound-off-field" data-path="title" value="' + escHtml(off.title) + '" placeholder="e.g. Romantic Zambezi Escape" /></label></p>';
        card += '    <p><label><strong>Offer Category</strong><br><select class="widefat outbound-off-field" data-path="offerCategory">';
        [['special_offer','Special Offer'],['honeymoon_package','Honeymoon Package'],['seasonal_promotion','Seasonal Promotion'],['meal_plan','Meal Plan'],['added_value','Added Value']].forEach(function (opt) {
          card += '<option value="' + opt[0] + '" ' + ((off.offerCategory || 'special_offer') === opt[0] ? 'selected' : '') + '>' + opt[1] + '</option>';
        });
        card += '    </select></label></p>';
        card += '    <p><label><strong>Price Adjustment Type</strong><br><select class="widefat outbound-off-field" data-path="priceType">';
        [['added_value','Added Value / Package Inclusions'],['fixed_offer','Fixed Offer Price (USD)'],['percentage_discount','Percentage Discount (%)'],['fixed_discount','Fixed Discount (USD)']].forEach(function (opt) {
          card += '<option value="' + opt[0] + '" ' + (off.priceType === opt[0] ? 'selected' : '') + '>' + opt[1] + '</option>';
        });
        card += '    </select></label></p>';
        card += '    <p><label><strong>Fixed Offer Price (USD)</strong><br><input type="number" step="0.01" min="0" class="widefat outbound-off-field" data-type="number" data-path="offerPriceUSD" value="' + (off.offerPriceUSD !== null && off.offerPriceUSD !== undefined ? escHtml(off.offerPriceUSD) : '') + '" /></label></p>';
        card += '    <p><label><strong>Discount (%)</strong><br><input type="number" step="1" min="0" max="100" class="widefat outbound-off-field" data-type="number" data-path="discountPercent" value="' + (off.discountPercent !== null && off.discountPercent !== undefined ? escHtml(off.discountPercent) : '') + '" /></label></p>';
        card += '    <p><label><strong>Valid From</strong><br><input type="date" class="widefat outbound-off-field" data-path="validFrom" value="' + escHtml(off.validFrom || '') + '" /></label></p>';
        card += '    <p><label><strong>Valid To</strong><br><input type="date" class="widefat outbound-off-field" data-path="validTo" value="' + escHtml(off.validTo || '') + '" /></label></p>';
        card += '    <p><label><strong>Visibility Status</strong><br><select class="widefat outbound-off-field" data-path="status"><option value="published" ' + (st === 'published' ? 'selected' : '') + '>Published</option><option value="draft" ' + (st === 'draft' ? 'selected' : '') + '>Draft</option><option value="archived" ' + (st === 'archived' ? 'selected' : '') + '>Archived</option><option value="trashed" ' + (st === 'trashed' ? 'selected' : '') + '>Trashed</option></select></label></p>';
        card += '    <p><label><strong>Enquiry CTA Label</strong><br><input type="text" class="widefat outbound-off-field" data-path="ctaLabel" value="' + escHtml(off.ctaLabel || '') + '" placeholder="Enquire About This Offer" /></label></p>';
        card += '  </div>';
        card += '  <p><label><strong>Description</strong><br><textarea rows="2" class="large-text outbound-off-field" data-path="description">' + escHtml(off.description || '') + '</textarea></label></p>';
        card += '  <div class="outbound-meta-grid">';
        card += '    <p><label><strong>Included Services (one per line)</strong><br><textarea rows="3" class="widefat outbound-off-list-field" data-path="includedServices" placeholder="Private sunset boat cruise&#10;Candlelit bush dinner&#10;Airport transfers">' + escHtml((off.includedServices || []).join('\n')) + '</textarea></label></p>';
        card += '    <p><label><strong>Guest Requirements &amp; Offer Conditions</strong><br><textarea rows="3" class="widefat outbound-off-field" data-path="conditions" placeholder="Minimum 3 nights stay; honeymoon proof within 6 months...">' + escHtml(off.conditions || '') + '</textarea></label></p>';
        card += '  </div>';
        card += '  <p><label><input type="checkbox" class="outbound-off-field" data-type="bool" data-path="applyToEntireProperty" ' + (off.applyToEntireProperty ? 'checked' : '') + ' /> <strong>Apply to Entire Property (all room / unit types)</strong></label></p>';
        if (unitsList.length) {
          card += '<p style="margin:6px 0 4px;"><strong>Or Link Specific Accommodation Unit Types:</strong></p><div class="outbound-related-grid">';
          unitsList.forEach(function (u) {
            var checked = (off.applicableUnitIds || []).indexOf(u.id) !== -1;
            card += '<label class="outbound-related-chip ' + (checked ? 'is-checked' : '') + '"><input type="checkbox" class="outbound-off-unit-chk" value="' + escHtml(u.id) + '" ' + (checked ? 'checked' : '') + ' /> <span>' + escHtml(u.name || u.id) + '</span></label>';
          });
          card += '</div>';
        }
        card += '</div></div>';
        return card;
      }).join('');
      $list.html(html);
    }

    renderOffers();
    $(document).on('outbound:propTabChanged', function (_e, tab) { if (tab === 'offers') renderOffers(); });
    $('#outbound-add-offer-btn').on('click', function () {
      offers.push({
        id: genUnitId('offer_'), title: 'New Special Offer', offerCategory: 'special_offer', description: '', galleryImages: [],
        includedServices: [], applicableUnitIds: [], applyToEntireProperty: false, validFrom: '', validTo: '',
        priceType: 'added_value', offerPriceUSD: null, discountPercent: null, discountAmountUSD: null,
        guestRequirements: '', conditions: '', status: 'published', ctaLabel: 'Enquire About This Offer', featured: false
      });
      renderOffers();
    });
    $('#outbound-offer-import-template-btn').on('click', function () {
      var tplId = String($('#outbound-offer-shared-template-select').val() || '');
      if (!tplId) return;
      var tplList = sharedOfferTemplates;
      if (!tplList.length) {
        try { tplList = JSON.parse($('#outbound-shared-offer-templates-config').text() || '[]'); } catch (_e) { tplList = []; }
      }
      var tpl = tplList.filter(function (item) { return item && item.id === tplId; })[0];
      if (!tpl) return;
      offers.push({
        id: genUnitId('offer_'),
        title: tpl.title || 'Imported Package',
        offerCategory: tpl.offerCategory || 'special_offer',
        description: tpl.summary || '',
        galleryImages: [],
        includedServices: Array.isArray(tpl.inclusions) ? tpl.inclusions.slice() : [],
        applicableUnitIds: [],
        applyToEntireProperty: true,
        validFrom: tpl.validFrom || '',
        validTo: tpl.validTo || '',
        priceType: 'added_value',
        offerPriceUSD: null,
        discountPercent: null,
        discountAmountUSD: null,
        guestRequirements: '',
        conditions: tpl.discountLabel || '',
        status: 'published',
        ctaLabel: 'Enquire About This Offer',
        featured: false
      });
      renderOffers();
    });
    $list.on('click', '.outbound-offer-duplicate', function () {
      var idx = Number($(this).closest('[data-offer-idx]').attr('data-offer-idx'));
      var copy = deepClone(offers[idx]);
      copy.id = genUnitId('offer_');
      copy.title = (copy.title || 'Offer') + ' (Copy)';
      offers.splice(idx + 1, 0, copy);
      renderOffers();
    });
    $list.on('click', '.outbound-offer-archive', function () {
      var idx = Number($(this).closest('[data-offer-idx]').attr('data-offer-idx'));
      if (!offers[idx]) return;
      offers[idx].status = offers[idx].status === 'archived' ? 'published' : 'archived';
      renderOffers();
    });
    $list.on('click', '.outbound-offer-restore', function () {
      var idx = Number($(this).closest('[data-offer-idx]').attr('data-offer-idx'));
      if (!offers[idx]) return;
      offers[idx].status = 'draft';
      renderOffers();
    });
    $list.on('click', '.outbound-offer-delete', function () {
      var idx = Number($(this).closest('[data-offer-idx]').attr('data-offer-idx'));
      var off = offers[idx];
      if (!off) return;
      var linkedCount = Array.isArray(off.applicableUnitIds) ? off.applicableUnitIds.length : 0;
      outboundConfirmDialog({
        title: 'Move Offer "' + (off.title || 'Untitled Offer') + '" to Trash?',
        bodyHtml: '<p>Moving this offer to Trash hides it from the public website without deleting the shared Package Template or any linked accommodation units.</p>',
        detailsList: [
          linkedCount ? ('Currently linked to ' + linkedCount + ' unit type(s); those units will remain untouched.') : 'No individual unit records will be affected.'
        ],
        safetyNote: 'Remember to click Save as Draft or Update Live to persist changes.',
        confirmLabel: 'Move Offer to Trash',
        confirmClass: 'button-primary',
        onConfirm: function () {
          off.status = 'trashed';
          renderOffers();
        }
      });
    });
    $list.on('click', '.outbound-offer-perm-delete', function () {
      var idx = Number($(this).closest('[data-offer-idx]').attr('data-offer-idx'));
      var off = offers[idx];
      if (!off) return;
      outboundConfirmDialog({
        title: 'Permanently Delete Offer "' + (off.title || 'Untitled Offer') + '"?',
        bodyHtml: '<p><strong>Second confirmation:</strong> This removes the offer from this property permanently.</p>',
        confirmLabel: 'Delete Offer Permanently',
        confirmClass: 'button-link-delete',
        requireText: 'DELETE',
        onConfirm: function () {
          offers.splice(idx, 1);
          renderOffers();
        }
      });
    });
    $list.on('input change', '.outbound-off-field', function () {
      var idx = Number($(this).closest('[data-offer-idx]').attr('data-offer-idx'));
      var off = offers[idx];
      if (!off) return;
      var path = $(this).data('path');
      var dtype = $(this).data('type');
      var val = dtype === 'bool' ? $(this).is(':checked') : $(this).val();
      if (dtype === 'number') val = $.trim(val) === '' ? null : Number(val);
      off[path] = val;
      syncOffersJson();
    });
    $list.on('input', '.outbound-off-list-field', function () {
      var idx = Number($(this).closest('[data-offer-idx]').attr('data-offer-idx'));
      var off = offers[idx];
      if (!off) return;
      off[$(this).data('path')] = String($(this).val() || '').split(/\r?\n/).map($.trim).filter(Boolean);
      syncOffersJson();
    });
    $list.on('change', '.outbound-off-unit-chk', function () {
      var idx = Number($(this).closest('[data-offer-idx]').attr('data-offer-idx'));
      var off = offers[idx];
      if (!off) return;
      var vals = [];
      $(this).closest('.outbound-unit-card').find('.outbound-off-unit-chk:checked').each(function () { vals.push($(this).val()); });
      off.applicableUnitIds = vals;
      syncOffersJson();
    });
    $jsonInput.closest('form').on('submit', syncOffersJson);
    $(document).on('mousedown click', '.editor-post-publish-button, .editor-post-publish-panel__toggle, .editor-post-save-draft', syncOffersJson);
  }

  function initPropertyAmenityAdder() {
    var $btn = $('#outbound-add-custom-prop-amenity-btn');
    var $inp = $('#outbound-custom-prop-amenity-input');
    var $grid = $('#outbound-prop-amenities-grid');
    if (!$btn.length || !$inp.length || !$grid.length || $btn.data('bound')) return;
    $btn.data('bound', true);

    function addPropAmenity() {
      var label = $.trim($inp.val());
      if (!label) return;
      var dup = false;
      $grid.find('input[type="checkbox"]').each(function () {
        if (String($(this).val()).toLowerCase() === label.toLowerCase()) {
          $(this).prop('checked', true).closest('.outbound-related-chip').addClass('is-checked');
          dup = true;
        }
      });
      if (!dup) {
        var chipHtml = '<label class="outbound-related-chip is-checked">' +
          '<input type="checkbox" name="outbound_amenities[]" value="' + escConfirm(label) + '" checked />' +
          '<span>' + escConfirm(label) + '</span>' +
          '</label>';
        $grid.append(chipHtml);
      }
      $inp.val('');
    }

    $btn.on('click', addPropAmenity);
    $inp.on('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        addPropAmenity();
      }
    });
  }

  function initAccommodationDashboard() {
    var $dash = $('#outbound-acc-dashboard');
    if (!$dash.length || $dash.data('acc-dash-init')) return;
    $dash.data('acc-dash-init', true);

    function closeMoreMenus() {
      $dash.find('.outbound-acc-more-menu').attr('hidden', true);
      $dash.find('.outbound-acc-more-toggle').attr('aria-expanded', 'false');
    }

    $dash.on('click', '.outbound-acc-more-toggle', function (e) {
      e.preventDefault();
      e.stopPropagation();
      var $menu = $(this).siblings('.outbound-acc-more-menu');
      var wasOpen = !$menu.is('[hidden]');
      closeMoreMenus();
      if (!wasOpen) {
        $menu.removeAttr('hidden');
        $(this).attr('aria-expanded', 'true');
      }
    });
    $(document).on('click.outboundMore', closeMoreMenus);

    function refreshBulkBar() {
      var checkedCount = $dash.find('.outbound-acc-row-check:checked').length;
      $('#outbound-acc-selected-count').text(checkedCount + ' selected');
      var op = $('#outbound-acc-bulk-select').val();
      $('#outbound-acc-bulk-apply').prop('disabled', checkedCount === 0 || !op);
    }

    $dash.on('change', '#outbound-acc-select-all', function () {
      $dash.find('.outbound-acc-row-check').prop('checked', $(this).is(':checked'));
      refreshBulkBar();
    });
    $dash.on('change', '.outbound-acc-row-check, #outbound-acc-bulk-select', refreshBulkBar);

    var $bulkForm = $('#outbound-acc-bulk-form');
    $bulkForm.on('submit', function (e) {
      var op = $('#outbound-acc-bulk-select').val();
      var $checked = $dash.find('.outbound-acc-row-check:checked');
      if (!op || !$checked.length) {
        e.preventDefault();
        return;
      }
      if (op === 'trash' && $bulkForm.data('confirmed-op') !== 'trash') {
        e.preventDefault();
        outboundConfirmDialog({
          title: 'Move ' + $checked.length + ' Property(s) to Trash?',
          bodyHtml: '<p>These accommodations and their public listings will be removed from the public website immediately and moved to Trash.</p>',
          safetyNote: 'You can restore trashed properties anytime before permanently deleting them.',
          confirmLabel: 'Move to Trash',
          confirmClass: 'button-primary',
          onConfirm: function () {
            $bulkForm.data('confirmed-op', 'trash').trigger('submit');
          }
        });
      } else if (op === 'permanent_delete' && $bulkForm.find('.outbound-bulk-confirm-flag').val() !== '1') {
        e.preventDefault();
        outboundConfirmDialog({
          title: 'Permanently Delete ' + $checked.length + ' Trashed Property(s)?',
          bodyHtml: '<p><strong>Second explicit confirmation required:</strong> Permanently deleting properties removes all owned room units, property rate plans, offers, and relationships from the database.</p>',
          safetyNote: 'Shared amenities, shared rate/offer templates, and WordPress Media Library files used elsewhere are preserved.',
          confirmLabel: 'Permanently Delete Selected',
          confirmClass: 'button-link-delete',
          requireText: 'DELETE',
          onConfirm: function () {
            $bulkForm.find('.outbound-bulk-confirm-flag').val('1');
            $bulkForm.trigger('submit');
          }
        });
      }
    });

    function submitSingleOp(op, id, confirmed) {
      $('#outbound-acc-single-op-input').val(op);
      $('#outbound-acc-single-id-input').val(id);
      $('#outbound-acc-single-confirm-input').val(confirmed ? '1' : '0');
      $('#outbound-acc-single-form').trigger('submit');
    }

    $dash.on('click', '.outbound-acc-single-op', function () {
      var op = $(this).data('op');
      var id = $(this).data('id');
      submitSingleOp(op, id, false);
    });

    function parseImpact($btn) {
      return parseImpactJson($btn);
    }

    $dash.on('click', '.outbound-acc-trash-btn', function () {
      var $btn = $(this);
      var id = $btn.data('id');
      var title = $btn.data('title') || 'this property';
      var imp = parseImpact($btn);
      var unitNames = Array.isArray(imp.unit_names) ? imp.unit_names : (Array.isArray(imp.unitNames) ? imp.unitNames : []);
      var unitsCount = Number(imp.units_count !== undefined ? imp.units_count : (imp.unitsCount || 0));
      var offersCount = Number(imp.offers_count !== undefined ? imp.offers_count : (imp.offersCount || 0));
      var ratePlansCount = Number(imp.rate_plans_count !== undefined ? imp.rate_plans_count : (imp.ratePlansCount || 0));
      var details = [
        'Associated Room & Accommodation Units hidden: ' + unitsCount + (unitNames.length ? (' (' + unitNames.slice(0, 5).join(', ') + (unitNames.length > 5 ? '...' : '') + ')') : ''),
        'Property offers/rate plans hidden from public display: ' + offersCount + ' offers, ' + ratePlansCount + ' rate plans',
        'Shared amenities & Media Library images remain completely safe.'
      ];
      outboundConfirmDialog({
        title: 'Move "' + title + '" to Trash?',
        bodyHtml: '<p>Moving <strong>' + escConfirm(title) + '</strong> to Trash immediately removes it from the public website directory and search results.</p>',
        detailsList: details,
        safetyNote: 'You can restore this property from the Trash tab before any permanent deletion occurs.',
        confirmLabel: 'Move to Trash',
        confirmClass: 'button-primary',
        onConfirm: function () {
          submitSingleOp('trash', id, false);
        }
      });
    });

    $dash.on('click', '.outbound-acc-perm-delete-btn', function () {
      var $btn = $(this);
      var id = $btn.data('id');
      var title = $btn.data('title') || 'this property';
      var imp = parseImpact($btn);
      var unitNames = Array.isArray(imp.unit_names) ? imp.unit_names : (Array.isArray(imp.unitNames) ? imp.unitNames : []);
      var unitsCount = Number(imp.units_count !== undefined ? imp.units_count : (imp.unitsCount || 0));
      var offersCount = Number(imp.offers_count !== undefined ? imp.offers_count : (imp.offersCount || 0));
      var ratePlansCount = Number(imp.rate_plans_count !== undefined ? imp.rate_plans_count : (imp.ratePlansCount || 0));
      var details = [
        'Owned Room & Accommodation Units removed: ' + unitsCount + (unitNames.length ? (' (' + unitNames.slice(0, 5).join(', ') + ')') : ''),
        'Owned Rate Plans & Offers removed: ' + ratePlansCount + ' rate plans, ' + offersCount + ' offers',
        'WordPress Media Library files and Shared Library amenities/templates used elsewhere will NOT be deleted.'
      ];
      outboundConfirmDialog({
        title: 'Permanently Delete "' + title + '"?',
        bodyHtml: '<p><strong>Irreversible Database Removal:</strong> Permanently deleting <strong>' + escConfirm(title) + '</strong> removes this property and all of its owned database records with zero orphans.</p>',
        detailsList: details,
        confirmLabel: 'Permanently Delete Property',
        confirmClass: 'button-link-delete',
        requireText: 'DELETE',
        onConfirm: function () {
          submitSingleOp('permanent_delete', id, true);
        }
      });
    });

    // Featured Order & Shared Panels
    $('#outbound-toggle-featured-panel').on('click', function () {
      var $p = $('#outbound-featured-panel');
      if ($p.is('[hidden]')) {
        $('#outbound-shared-panel').attr('hidden', true);
        $p.removeAttr('hidden');
      } else {
        $p.attr('hidden', true);
      }
    });
    $('#outbound-toggle-shared-panel').on('click', function () {
      var $p = $('#outbound-shared-panel');
      if ($p.is('[hidden]')) {
        $('#outbound-featured-panel').attr('hidden', true);
        $p.removeAttr('hidden');
      } else {
        $p.attr('hidden', true);
      }
    });
    $dash.on('click', '.outbound-acc-panel-close', function () {
      $($(this).data('target')).attr('hidden', true);
    });

    $dash.on('click', '.outbound-feat-up', function () {
      var $li = $(this).closest('li');
      $li.prev('li').before($li);
    });
    $dash.on('click', '.outbound-feat-down', function () {
      var $li = $(this).closest('li');
      $li.next('li').after($li);
    });
    $('#outbound-featured-order-form').on('submit', function () {
      var slugs = [];
      $('#outbound-featured-order-list li').each(function () {
        slugs.push($(this).attr('data-slug'));
      });
      $('#outbound-featured-order-csv').val(slugs.join(','));
    });

    // Shared Library Edit & Safe Delete Warnings
    $dash.on('click', '.outbound-shared-edit-btn', function () {
      var $btn = $(this);
      var $card = $btn.closest('.outbound-shared-card');
      $card.find('.outbound-shared-edit-id').val($btn.data('id'));
      $card.find('.outbound-shared-edit-label').val($btn.data('label')).trigger('focus');
      $card.find('.outbound-shared-edit-cat').val($btn.data('cat'));
      if ($card.find('.outbound-shared-edit-amount').length) {
        $card.find('.outbound-shared-edit-amount').val($btn.data('amount'));
      }
    });
    $dash.on('click', '.outbound-shared-delete-btn', function () {
      var $btn = $(this);
      var lib = $btn.data('lib');
      var id = $btn.data('id');
      var label = $btn.data('label') || id;
      var deps;
      try { deps = JSON.parse($btn.attr('data-deps') || '[]'); } catch (_e) { deps = []; }
      var depNames = Array.isArray(deps)
        ? deps.map(function (d) { return (d.postTitle || d.postId) + (d.unitName ? (' -> ' + d.unitName) : ''); })
        : [];
      outboundConfirmDialog({
        title: 'Permanently Delete Shared Record "' + label + '"?',
        bodyHtml: depNames.length
          ? '<p><strong>Warning:</strong> This shared record is currently referenced by <strong>' + depNames.length + '</strong> accommodation record(s). Deleting it removes it from the Shared Library and detaches it everywhere.</p>'
          : '<p>No properties are currently linked to this shared record. Delete it from the Shared Library?</p>',
        detailsList: depNames.slice(0, 8),
        safetyNote: 'Tip: To remove this item from just ONE property or room, uncheck it inside that property/room editor instead.',
        confirmLabel: 'Delete Shared Record',
        confirmClass: 'button-link-delete',
        requireText: depNames.length ? 'DELETE' : '',
        onConfirm: function () {
          $('#outbound-shared-del-lib').val(lib);
          $('#outbound-shared-del-id').val(id);
          $('#outbound-shared-del-confirm').val('1');
          $('#outbound-shared-delete-form').trigger('submit');
        }
      });
    });
  }

  function parseImpactJson($btn) {
    try {
      return JSON.parse($btn.attr('data-impact') || '{}') || {};
    } catch (_e) {
      return {};
    }
  }

  function buildImpactDetailsList(imp) {
    imp = imp && typeof imp === 'object' ? imp : {};
    var unitNames = Array.isArray(imp.unit_names) ? imp.unit_names : (Array.isArray(imp.unitNames) ? imp.unitNames : []);
    var unitsCount = Number(imp.units_count !== undefined ? imp.units_count : (imp.unitsCount || 0));
    var offersCount = Number(imp.offers_count !== undefined ? imp.offers_count : (imp.offersCount || 0));
    var ratePlansCount = Number(imp.rate_plans_count !== undefined ? imp.rate_plans_count : (imp.ratePlansCount || 0));
    var ptype = imp.post_type || (unitsCount || offersCount || ratePlansCount ? 'accommodation' : 'item');
    if (ptype === 'accommodation' || unitsCount > 0 || offersCount > 0 || ratePlansCount > 0) {
      return [
        'Associated Room & Accommodation Units affected: ' + unitsCount + (unitNames.length ? (' (' + unitNames.slice(0, 5).join(', ') + (unitNames.length > 5 ? '...' : '') + ')') : ''),
        'Property offers & rate plans affected: ' + offersCount + ' offers, ' + ratePlansCount + ' rate plans',
        'Shared amenities & WordPress Media Library image files remain preserved.'
      ];
    }
    return [
      'Removes this record from public website listings and search results.',
      'Media Library files used elsewhere remain completely safe.'
    ];
  }

  function initStudioCrudActions() {
    var $form = $('#outbound-cms-item-form');
    if (!$form.length || $form.data('studio-crud-bound')) return;
    $form.data('studio-crud-bound', true);

    function submitStudioAction(actionVal, confirmedDelete) {
      var $ov = $('#outbound-studio-action-override');
      $ov.val(actionVal).prop('disabled', false);
      $('#outbound-studio-confirm-delete').val(confirmedDelete ? '1' : '0');
      $form.trigger('submit');
    }

    $(document).on('click', '.outbound-studio-duplicate-btn', function () {
      submitStudioAction('duplicate_item', false);
    });

    $(document).on('click', '.outbound-studio-restore-btn', function () {
      submitStudioAction('restore_item', false);
    });

    $(document).on('click', '.outbound-studio-trash-btn', function () {
      var $btn = $(this);
      var title = $btn.data('title') || 'this record';
      var imp = parseImpactJson($btn);
      outboundConfirmDialog({
        title: 'Move "' + title + '" to Trash?',
        bodyHtml: '<p>Moving <strong>' + escConfirm(title) + '</strong> to Trash removes it immediately from the public website directory and pages.</p>',
        detailsList: buildImpactDetailsList(imp),
        safetyNote: 'You can restore this record anytime from the Trash tab before any permanent deletion occurs.',
        confirmLabel: 'Move to Trash',
        confirmClass: 'button-primary',
        onConfirm: function () {
          submitStudioAction('trash_item', false);
        }
      });
    });

    $(document).on('click', '.outbound-studio-perm-delete-btn', function () {
      var $btn = $(this);
      var title = $btn.data('title') || 'this record';
      var imp = parseImpactJson($btn);
      outboundConfirmDialog({
        title: 'Permanently Delete "' + title + '"?',
        bodyHtml: '<p><strong>Irreversible Database Removal:</strong> Permanently deleting <strong>' + escConfirm(title) + '</strong> removes this record and its owned metadata cleanly with zero orphans.</p>',
        detailsList: buildImpactDetailsList(imp),
        confirmLabel: 'Permanently Delete Forever',
        confirmClass: 'button-link-delete',
        requireText: 'DELETE',
        onConfirm: function () {
          submitStudioAction('permanent_delete_item', true);
        }
      });
    });
  }

  function initCptDashboards() {
    $('.outbound-cpt-dashboard-card').each(function () {
      var $card = $(this);
      if ($card.data('cpt-dash-init')) return;
      $card.data('cpt-dash-init', true);

      function closeCardMenus() {
        $card.find('.outbound-acc-more-menu').attr('hidden', true);
        $card.find('.outbound-acc-more-toggle').attr('aria-expanded', 'false');
      }

      $card.on('click', '.outbound-acc-more-toggle', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var $menu = $(this).siblings('.outbound-acc-more-menu');
        var wasOpen = !$menu.is('[hidden]');
        $('.outbound-acc-more-menu').attr('hidden', true);
        $('.outbound-acc-more-toggle').attr('aria-expanded', 'false');
        if (!wasOpen) {
          $menu.removeAttr('hidden');
          $(this).attr('aria-expanded', 'true');
        }
      });
      $(document).on('click.outboundCptMore', closeCardMenus);

      function refreshCardBulk() {
        var checkedCount = $card.find('.outbound-cpt-row-check:checked').length;
        $card.find('.outbound-cpt-selected-count').text(checkedCount + ' selected');
        var op = $card.find('.outbound-cpt-bulk-select').val();
        $card.find('.outbound-cpt-bulk-apply').prop('disabled', checkedCount === 0 || !op);
      }

      $card.on('change', '.outbound-cpt-select-all', function () {
        $card.find('.outbound-cpt-row-check').prop('checked', $(this).is(':checked'));
        refreshCardBulk();
      });
      $card.on('change', '.outbound-cpt-row-check, .outbound-cpt-bulk-select', refreshCardBulk);

      var $bulkForm = $card.find('.outbound-cpt-bulk-form');
      $bulkForm.on('submit', function (e) {
        var op = $card.find('.outbound-cpt-bulk-select').val();
        var $checked = $card.find('.outbound-cpt-row-check:checked');
        if (!op || !$checked.length) {
          e.preventDefault();
          return;
        }
        if (op === 'trash' && $bulkForm.data('confirmed-op') !== 'trash') {
          e.preventDefault();
          outboundConfirmDialog({
            title: 'Move ' + $checked.length + ' Selected Item(s) to Trash?',
            bodyHtml: '<p>Selected items will leave the public website immediately and move to Trash, where they can be restored anytime.</p>',
            confirmLabel: 'Move to Trash',
            confirmClass: 'button-primary',
            onConfirm: function () {
              $bulkForm.data('confirmed-op', 'trash').trigger('submit');
            }
          });
        } else if (op === 'permanent_delete' && $bulkForm.find('.outbound-cpt-bulk-confirm-flag').val() !== '1') {
          e.preventDefault();
          outboundConfirmDialog({
            title: 'Permanently Delete ' + $checked.length + ' Trashed Item(s)?',
            bodyHtml: '<p><strong>Second explicit confirmation required:</strong> Permanently deleting removes the selected records and owned metadata from WordPress.</p>',
            safetyNote: 'WordPress Media Library files used elsewhere are preserved.',
            confirmLabel: 'Permanently Delete Selected',
            confirmClass: 'button-link-delete',
            requireText: 'DELETE',
            onConfirm: function () {
              $bulkForm.find('.outbound-cpt-bulk-confirm-flag').val('1');
              $bulkForm.trigger('submit');
            }
          });
        }
      });

      function submitCardOp(op, id, confirmed) {
        var $sform = $card.find('.outbound-cpt-single-form');
        $sform.find('.outbound-cpt-single-op-input').val(op);
        $sform.find('.outbound-cpt-single-id-input').val(id);
        $sform.find('.outbound-cpt-single-confirm-input').val(confirmed ? '1' : '0');
        $sform.trigger('submit');
      }

      $card.on('click', '.outbound-cpt-single-op', function () {
        submitCardOp($(this).data('op'), $(this).data('id'), false);
      });

      $card.on('click', '.outbound-cpt-trash-btn', function () {
        var $btn = $(this);
        var id = $btn.data('id');
        var title = $btn.data('title') || 'this item';
        var imp = parseImpactJson($btn);
        outboundConfirmDialog({
          title: 'Move "' + title + '" to Trash?',
          bodyHtml: '<p>Moving <strong>' + escConfirm(title) + '</strong> to Trash removes it immediately from public listings.</p>',
          detailsList: buildImpactDetailsList(imp),
          safetyNote: 'You can restore it anytime from the Trash tab before permanent deletion.',
          confirmLabel: 'Move to Trash',
          confirmClass: 'button-primary',
          onConfirm: function () {
            submitCardOp('trash', id, false);
          }
        });
      });

      $card.on('click', '.outbound-cpt-perm-delete-btn', function () {
        var $btn = $(this);
        var id = $btn.data('id');
        var title = $btn.data('title') || 'this item';
        var imp = parseImpactJson($btn);
        outboundConfirmDialog({
          title: 'Permanently Delete "' + title + '"?',
          bodyHtml: '<p><strong>Irreversible Database Removal:</strong> Permanently deleting <strong>' + escConfirm(title) + '</strong> removes this record and owned metadata with zero orphans.</p>',
          detailsList: buildImpactDetailsList(imp),
          confirmLabel: 'Permanently Delete',
          confirmClass: 'button-link-delete',
          requireText: 'DELETE',
          onConfirm: function () {
            submitCardOp('permanent_delete', id, true);
          }
        });
      });
    });
  }

  $(function () {
    initAccommodationDashboard();
    initCptDashboards();
    initStudioCrudActions();
    initPropertyAmenityAdder();
    initPropertyTabs();
    initRoomUnitManager();
    initRatePlanManager();
    initOfferManager();
    if (typeof MutationObserver !== 'undefined') {
      var obs = new MutationObserver(function () {
        var $shell = $('#outbound-prop-editor-shell');
        if ($shell.length && !$shell.data('tabs-bound')) {
          initPropertyTabs();
          initPropertyAmenityAdder();
        }
        var $l = $('#outbound-unit-manager-list');
        if ($l.length && !$l.data('outbound-initialized')) {
          initRoomUnitManager();
          initRatePlanManager();
          initOfferManager();
        }
      });
      if (document.body) {
        obs.observe(document.body, { childList: true, subtree: true });
      }
    }
  });
})(jQuery);
