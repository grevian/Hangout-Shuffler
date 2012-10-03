gapi.hangout.onApiReady.add( function(eventObj) {
        try {
                if ( eventObj.isApiReady )
                        shuffle_init();
        }
        catch(e) {
                console.log(e.stack);
        }
} );

function shuffle_init() {
        var shuffle_count = 4;
        var id = 0;
        var dataShare = gapi.hangout.data;
        var user_list = [];

        s = dataShare.getState();
        if ( 'user_list' in s ) {
                id = s['id'];
                user_list = eval(s['user_list']);
                $('#testlist').empty();
                for ( var i = 0; i < user_list.length; i++ ) {
                        var user = user_list[i];
                        var username = Object.keys( user )[0];
                        var user_id = user[username];
                        $('#testlist').prepend("<li data-id='id-" + user_id +"'>" + username + "</li>");
                }
        }

        dataShare.onMessageReceived.add( function(e) {
                if ( e.message == 'do_shuffle' )
                        do_shuffle(1, false);
        });

        dataShare.onStateChanged.add( function(e) {
                s = dataShare.getState();
                if ('id' in e.addedKeys) {
                        id = s['id'];
                }

                if ('user_list' in e.addedKeys) {
                        user_list = eval(s['user_list']);
                        $('#testlist').empty();
                        for ( var i = 0; i < user_list.length; i++ ) {
                                var user = user_list[i];
                                var username = Object.keys( user )[0];
                                var user_id = user[username];
                                $('#testlist').prepend("<li data-id='id-" + user_id +"'>" + username + "</li>");
                        }
                }
                if ('shuffle_to' in e.addedKeys ) {
                        var shuffled_users = eval( s['shuffle_to'] );

                        // Create the model to animate to
                        var p = $('<ul/>');
                        for(var i = 0; i < shuffled_users.length; i++) {
                                var user = shuffled_users[i];
                                var username = Object.keys(user)[0];
                                var current_id = user[username];
                                p.append( $('<li data-id="id-'+current_id+'">'+username+'</li>') );
                        }
                        shuffle_to(p.children());
                }
        });

        function add_user() {
                // Get user name, reset field, and return if the name is blank
                var newUser = $('#newname').val();
                $('#newname').val('');
                if ( !$.trim(newUser).length ) return;

                // Add user to our shared state
                var user = {};
                user[newUser] = ++id;
                user_list.push( user );

                // Share the new user with other clients
                var user_list_json = JSON.stringify( user_list );
                dataShare.setValue( 'user_list', user_list_json );
                dataShare.setValue( 'id', id );

                // update UI
                $('#testlist').prepend("<li data-id='id-" + id +"'>" + newUser + "</li>");
        }

        $('#secret-click').click( function() { $('#secret').slideToggle(); return false; });
        $('#adduser').click( function() { add_user(); });

        $('#reset').click( function() {
                $('#testlist').empty();
                $('#shuffle').removeAttr("disabled");
                $('#adduser').removeAttr("disabled");
                user_list = [];
                dataShare.clearValue( 'user_list' );
        });

        $('form').submit( function() {
                if ( !$('#adduser').attr("disabled") )
                        add_user();
                return false;
        });

        function do_shuffle( x, isMaster ) {
                // When finished, re-enable the buttons and return
                if ( x <= 0 ) {
                        $('#shuffle').removeAttr("disabled");
                        $('#adduser').removeAttr("disabled");
                        $('#reset').removeAttr("disabled");
                        return;
                }

                // Shuffle a copy of the list of users
                var shuffled_users = user_list.slice(0);
                _shuffle(shuffled_users);

                // Create the model to animate to
                var p = $('<ul/>');
                for(var i = 0; i < shuffled_users.length; i++) {
                        var user = shuffled_users[i];
                        var username = Object.keys(user)[0];
                        var current_id = user[username];
                        p.append( $('<li data-id="id-'+current_id+'">'+username+'</li>') );
                }

                // Animate or sync the shuffle on everyone else if this is the initator
                if ( isMaster ) {
                        if ( isMaster )
                                dataShare.setValue( 'shuffle_to', JSON.stringify(shuffled_users) );
                        else
                                dataShare.sendMessage('do_shuffle');
                }

                // Animate to our next or final position locally
                $('#testlist').quicksand( p.children(), { duration: 400, adjustHeight: false, }, function() { do_shuffle(x-1, isMaster); });
        }

        // Fisher-Yates shuffle from http://dtm.livejournal.com/38725.html
        function _shuffle( list ) {
                var i, j, t;
                for (i = 1; i < list.length; i++) {
                        j = Math.floor(Math.random()*(1+i));  // choose j in [0..i]
                        if (j != i) {
                                t = list[i];                        // swap list[i] and list[j]
                                list[i] = list[j];
                                list[j] = t;
                        }
                }
        }

        function shuffle_to( values ) {
                $('#testlist').quicksand( values, { duration: 400, adjustHeight: false, } );
        }

        $('#shuffle').click( function() {
                $('#shuffle').attr("disabled","disabled");
                $('#adduser').attr("disabled","disabled");
                $('#reset').attr("disabled","disabled");
                do_shuffle(shuffle_count, true);
        });
};
