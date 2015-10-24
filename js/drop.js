var template = '<div class="preview">' + 
               '<span class="imageHolder">' +
               '<img />' +
               '<span class="uploaded"></span>' +
               '<div class="progressHolder">' +
               '<div class="progress"></div>' +
               '</div>'+
               '<div>';

function createImage(file) {
  var preview = $(template), image = $('img', preview);

  var reader = new FileReader();

  image.width = 100;
  image.height = 100;

  reader.onload = function(e ) {
    image.attr('src',e.target.result);
  };

  reader.readAsDataURL(file);

  message.hide();
  preview.appendTo(upload-box);

  $.data(file,preview);
}

$(function(){
  var uploadbox = $('#upload-box)'), message = $('.message', uploadbox);
  uploadbox.filedrop ({
    paramname: 'pic',
    maxfiles: 20,
    maxfilesize: 10,
    url: 'http://ec2-52-16-199-4.eu-west-1.compute.amazonaws.com/php/imageUP.php',
    uploadFinished:function(i,file,response) {
      $.data(file).addClass('done');
    },
    error: function(err, file) {
      switch(err) {
        case 'BrowserNotSupported':
          showMessage('Your browser does not support HTML5 file uploads...');
          break;
        case 'TooManyFiles':
          alert('You have tried to upload too many files');
          break;
        case 'FileTooLarge':
          alert(file.name + ' is too large.');
          break;
        default:
          break;
      },
    },
    // called before each upload
    beforeEach: function(file){
      if(!file.type.match(/^image\//)){
        alert('Only images can be uploaded.';)
        return false;
      }
    },

    uploadStarted: function(i, file, len){
      createImage(file);
    },
    
      progressUpdated: function(i, file, progress){
        $.data(file).find('.progress').width(progress);
      }
    });
  var template = '...'

  function showMessage(msg){
    message.html(msg);
  }
});



