$(document).ready(function() {
    var background = chrome.extension.getBackgroundPage();

    // Restore options
    background.getOptions(function(options) {
        $('#category').prop('checked', options.category);
        $('#preview').prop('checked', options.preview);
        $('#viewcount').prop('checked', options.viewcount);
        updatePreview();
    });

    $('#category').change(function() {
        chrome.storage.sync.set({
            category: $(this).prop('checked')
        });
        updatePreview();
    });

    $('#preview').change(function() {
        chrome.storage.sync.set({
            preview: $(this).prop('checked')
        });
        updatePreview();
    });

    $('#viewcount').change(function() {
        chrome.storage.sync.set({
            viewcount: $(this).prop('checked')
        });
        updatePreview();
    });
});

function updatePreview(){
    if($('#category').prop('checked')) {
        $('#game').show();
    } else {
        $('#game').hide();
    }

    if($('#preview').prop('checked')) {
        $('#channel-preview').show();
        $('#channel').removeClass('no-preview');
    } else {
        $('#channel-preview').hide();
        $('#channel').addClass('no-preview');
    }

    if($('#viewcount').prop('checked')) {
        $('#channel-live').show();
    } else {
        $('#channel-live').hide();
    }
}