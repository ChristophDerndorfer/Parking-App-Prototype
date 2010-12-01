var google_map;

Ext.setup({
	tabletStartupScreen: 'tablet_startup.png',
	phoneStartupScreen: 'phone_startup.png',
	icon: 'icon.png',
	glossOnIcon: false,
	onReady: function() {

		// The following is accomplished with the Google Map API
		var position = new google.maps.LatLng(48.1999500,16.3680658592);

		infowindow = new google.maps.InfoWindow({
			content: 'Sencha Touch HQ'
		});

		//Tracking Marker Image
		point = new google.maps.MarkerImage(
			'point.png',
			new google.maps.Size(32, 31),
			new google.maps.Point(0,0),
			new google.maps.Point(16, 31)
		  );

		shadow = new google.maps.MarkerImage(
			'shadow.png',
			new google.maps.Size(64, 52),
			new google.maps.Point(0,0),
			new google.maps.Point(-5, 42)
		  );
		  
		parkgarage = new google.maps.MarkerImage(
			'parkgarage.png',
			new google.maps.Size(64, 52),
			new google.maps.Point(0,0),
			new google.maps.Point(-5, 42)
		  );
		  
		arrow = new google.maps.MarkerImage(
			'arrow.png',
			new google.maps.Size(64, 52),
			new google.maps.Point(0,0),
			new google.maps.Point(-5, 42)
		  );

		trackingButton = Ext.create({
		   xtype   : 'button',
		   iconMask: true,
		   iconCls : 'locate'
		});

		toolbar = new Ext.Toolbar({
				dock: 'top',
				xtype: 'toolbar',
				ui : 'light',
				defaults: {
					iconMask: false
				},
				items: [
					{
						xtype: 'searchfield',
						placeHolder: 'Search',
						name: 'searchfield',
						width: 140
					}, {
						icon: 'locationbutton.png',
						title: 'Go to my location',
						width: 50,
						padding: 5,
						handler : function(){
							//disable tracking
							//trackingButton.ownerCt.setActive(trackingButton, false);
							if (geo.latitude != null && geo.latitude != 0)
								google_map.map.panTo(new google.maps.LatLng(geo.latitude, geo.longitude));
						}
					}, {
						icon: 'parkbutton.png',
						title: 'Nearest...',
						width: 50,
						padding: 5,
						handler: function() {
							if (!this.popup) {
								this.popup = new Ext.Panel({
									floating: true,
									modal: true,
									centered: false,
									x: 5,
									y: 50,
									width: 300,
									height: 100,
									styleHtmlContent: true,
									scroll: 'vertical',
									html: '<p align="center"><img src="freeparking_popup.png"> &nbsp; <img src="garage_popup.png"></p>'
								});
							}
							this.popup.show('pop');
						}
					}, {
						icon: 'infobutton.png',
						width: 50,
						padding: 5,
						title: 'Info',
						handler: function() {
							if (!this.popup) {
								this.popup = new Ext.Panel({
									floating: true,
									modal: true,
									centered: true,
									width: 300,
									height: 350,
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
					}
				]
			});

		google_map = new Ext.Map({
			title: 'Map',
			mapOptions : {
				useCurrentLocation: false,
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
				new Ext.plugin.GMap.Traffic({ hidden : true })
			],

		});
		
		var geo = new Ext.util.GeoLocation({
				autoUpdate: true,
				listeners: {
					locationupdate: function (geo) {
						//alert('New location: ' + geo.latitude + ', ' + geo.longitude);
					},
					locationerror: function (   geo,
												bTimeout, 
												bPermissionDenied, 
												bLocationUnavailable, 
												message) {
						if(bTimeout){
							//alert('Timeout occurred.');
						}
						else{
							//alert('Error occurred.' + message);
						}
					}
				}
			})
		
		new Ext.Panel({
			fullscreen: true,
			dockedItems: [toolbar],
			items: [google_map]
		});
		
	}
});