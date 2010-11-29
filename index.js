Ext.setup({
    tabletStartupScreen: 'tablet_startup.png',
    phoneStartupScreen: 'phone_startup.png',
    icon: 'icon.png',
    glossOnIcon: false,
    onReady: function() {

        // The following is accomplished with the Google Map API
        var position = new google.maps.LatLng(48.1999500,16.3680658592),

            infowindow = new google.maps.InfoWindow({
                content: 'Sencha Touch HQ'
            }),

                //Tracking Marker Image
                image = new google.maps.MarkerImage(
                    'point.png',
                    new google.maps.Size(32, 31),
                    new google.maps.Point(0,0),
                    new google.maps.Point(16, 31)
                  ),

                shadow = new google.maps.MarkerImage(
                    'shadow.png',
                    new google.maps.Size(64, 52),
                    new google.maps.Point(0,0),
                    new google.maps.Point(-5, 42)
                  ),
				  
				parkgarage = new google.maps.MarkerImage(
                    'parkgarage.png',
                    new google.maps.Size(64, 52),
                    new google.maps.Point(0,0),
                    new google.maps.Point(-5, 42)
                  ),
				  
				arrow = new google.maps.MarkerImage(
                    'arrow.png',
                    new google.maps.Size(64, 52),
                    new google.maps.Point(0,0),
                    new google.maps.Point(-5, 42)
                  ),

            trackingButton = Ext.create({
               xtype   : 'button',
               iconMask: true,
               iconCls : 'locate'
            } ),

            toolbar = new Ext.Toolbar({
                    dock: 'top',
                    xtype: 'toolbar',
                    ui : 'light',
                    defaults: {
                        iconMask: true
                    },
                    items : [{
					xtype: 'searchfield',
                placeHolder: 'Search',
                name: 'searchfield',
				width: 140
            },
					{

            icon: 'locationbutton.png',
			handler : function(){
                      //disable tracking
                          trackingButton.ownerCt.setActive(trackingButton, false);
                          map.panTo(this.position);
                      }
        }, {
            icon: 'parkbutton.png',
			handler: function() {
            if (!this.popup) {
                this.popup = new Ext.Panel({
                    floating: true,
                    modal: true,
                    centered: false,
                    width: 300,
                    height: 100,
                    styleHtmlContent: true,
                    scroll: 'vertical',
                    html: '<p><img src="freeparking_popup.png"> <img src="garage_popup.png"></p>'
                });
            }
            this.popup.show('pop')
    }
        
                },{
				iconCls: 'info',
        title: 'Info',
		handler: function() {
            if (!this.popup) {
                this.popup = new Ext.Panel({
                    floating: true,
                    modal: true,
                    centered: true,
                    width: 300,
                    height: 400,
                    styleHtmlContent: true,
                    scroll: 'vertical',
                    html: '<p><b>Kurzparkzonen</b><br /><b>Preis:</b><br />0.5h - &#8364;0.60<br />1h - &#8364;1.20<br />1.5h - &#8364;1.80<br /><b>Zeiten:</b><br />Montag-Freitag, 8:00 - 22:00 Uhr<br />Samstags, Sonntags und Feiertags frei<br /><b>Verkaufsstellen:</b><br /></p>',
                    dockedItems: [{
                        dock: 'top',
                        xtype: 'toolbar',
                        title: 'Wien'
                    }]
                });
            }
            this.popup.show('pop')
    }

    }]
                });

        var map = new Ext.Map({
		
			title: 'Map',
			//getLocation: true,

            mapOptions : {
                center : new google.maps.LatLng(48.1999500,16.3680658592),
                zoom : 17,
                mapTypeId : google.maps.MapTypeId.ROADMAP,
                navigationControl: true,
                navigationControlOptions: {
                        style: google.maps.NavigationControlStyle.SMALL,
						position: google.maps.ControlPosition.RIGHT_BOTTOM
                    }
            },

            plugins : [
                new Ext.plugin.GMap.Tracker({
                        trackSuspended : true,   //suspend tracking initially
                        highAccuracy   : false,
                        marker : new google.maps.Marker({
                            position: position,
                            title : 'Your current location',
                            icon  : arrow
                          })
                }),
                new Ext.plugin.GMap.Traffic({ hidden : true })
            ],

        });
		
		var downtown;
				
		var triangleCoords = [
			new google.maps.LatLng(48.0, 16.0),
			new google.maps.LatLng(48.0, 17.0),
			new google.maps.LatLng(49.0, 16.0)
			];
			
		downtown = new google.maps.Polygon({
			paths: triangleCoords,
			strokeColor: "#FF0000",
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: "#FF0000",
			fillOpacity: 0.35
			});
			
		downtown.setMap(map.map);

        new Ext.Panel({
            fullscreen: true,
            dockedItems: [toolbar],
            items: [map]
        });
		
		var position = new google.maps.LatLng(48.1999500,16.2680658592);
		
		var marker = new google.maps.Marker({
                            position: position,
                            title : 'Parkgarage 1',
							map : map,
                            icon  : parkgarage
                          })
		
    }
	

});