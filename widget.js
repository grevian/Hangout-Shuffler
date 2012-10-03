gapi.hangout.onApiReady.add(
  function() {
                var $data = $('#testlist').clone();
                var id = 0;
                var shuffle_count = 4;

                function add_user() {
                        var newUser = $('#newname').val();
                        $('#newname').val('');
                        if ( !$.trim(newUser).length ) {
                          return;
                        }
                        $('#testlist').prepend("<li data-id='id-" + ++id +"'>" + newUser + "</li>");
                        $data = $('#testlist').clone();
                }

                $('#secret-click').click( function() {
                        $('#secret').slideToggle();
                        return false;
                });

                $('#reset').click( function() {
                        $('#testlist').empty();
                        $data = $('#testlist').clone();
                        $('#shuffle').removeAttr("disabled");
                        $('#adduser').removeAttr("disabled");
                });

                $('#adduser').click( function() {
                        add_user();
                });

                $('form').submit( function() {
                        if ( !$('#adduser').attr("disabled") ) {
                            add_user();
                        }
                        return false;
                });

                function do_shuffle( x ) {
                     if ( x <= 0 ) {
                             $('#shuffle').removeAttr("disabled");
                             $('#adduser').removeAttr("disabled");
                             $('#reset').removeAttr("disabled");
                             return;
                     }
                     var shuffled = $data.find("li").sorted({ by: function(v) { return Math.random(); } });
                     $('#testlist').quicksand( shuffled, { duration: 400, adjustHeight: false, }, function() { do_shuffle(x-1); });
                }

                $('#shuffle').click( function() {
                                $('#shuffle').attr("disabled","disabled");
                                $('#adduser').attr("disabled","disabled");
                                $('#reset').attr("disabled","disabled");
                                do_shuffle(shuffle_count);
                });
});

