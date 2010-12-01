Ext.setup({
	tabletStartupScreen: 'tablet_startup.png',
	phoneStartupScreen: 'phone_startup.png',
	icon: 'icon.png',
	glossOnIcon: false,
	onReady: function() {

		// The following is accomplished with the Google Map API
		var position = new google.maps.LatLng(48.2000950,16.3684658592);
		var follow_location = true;
		var viewport;
		var activeIW = null;
		var popup;
		
		infowindow = new google.maps.InfoWindow({
			content: 'Sencha Touch HQ'
		});
		
		iwKurzparkzone = new google.maps.InfoWindow({
			content: 'Kurzparkzone info'
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
			new google.maps.Size(20, 20),
			new google.maps.Point(0,0),
			new google.maps.Point(10, 10)
		  );
		  
		arrow = new google.maps.MarkerImage(
			'arrow.png',
			new google.maps.Size(50, 50),
			new google.maps.Point(0,0),
			new google.maps.Point(25, 25)
		  );

//		trackingButton = Ext.create({
//		   xtype   : 'button',
//		   iconMask: true,
//		   iconCls : 'locate'
//		});

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
						width: 120
					},{
						xtype: 'spacer'
					},{
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
							if (!popup) {
								popup = new Ext.Panel({
									floating: true,
									modal: true,
									centered: false,
									x: 5,
									y: 50,
									width: 300,
									height: 150,
								    style: {
										backgroundColor: '#000'
									},
									scroll: 'vertical',
									items : [
								                new Ext.Button({
								                    ui  : 'android',
								                    text: 'Free Parking',
								                    icon: 'freeparking_popup.png',
								                    margin: '10',
								                    handler: function() {
								                		
								                	}
								                }),
								                new Ext.Button({
								                    ui  : 'android',
								                    text: 'Garage Parking',
								                    icon: 'garage_popup.png',
								                    margin: '10',
								                    handler: function() {
								                		popup.hide();
								                	}
								                })]
								});
							}
							popup.show('pop');
						}
					}
				]
			});

		google_map = new Ext.Map({
			title: 'Map',
			mapOptions : {
				useCurrentLocation: false,
				center : position,
				zoom : 17,
				mapTypeId : google.maps.MapTypeId.ROADMAP,
				mapTypeControl: false,
				navigationControl: true,
				navigationControlOptions: {
						style: google.maps.NavigationControlStyle.SMALL,
						position: google.maps.ControlPosition.RIGHT_BOTTOM
					}
			},

			plugins : [
				new Ext.plugin.GMap.Traffic({ hidden : true })
			]

		});
		
		var geo = new Ext.util.GeoLocation({
				autoUpdate: true,
				listeners: {
					locationupdate: function (geo) {
						// reposition the arrow image
						position = new google.maps.LatLng(geo.latitude, geo.longitude);
						arrowMarker.setPosition(position);
						
						if (follow_location)
							google_map.map.panTo(new google.maps.LatLng(geo.latitude, geo.longitude));
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
			});
		geo.updateLocation();
		
		infobutton = new Ext.Button({
			icon: 'infobutton.png',
			ui: 'normal',
			floating: true,
			width: 50,
			height: 50,
			x: 50,
			y: 50,
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
				this.popup.show('pop');
			}
		});
		
		viewport = new Ext.Panel({
			fullscreen: true,
			dockedItems: [toolbar],
			items: [google_map, infobutton],
			layout: 'fit'
		});
		
		var arrowMarker = new google.maps.Marker({
			position: position,
			title: 'My location',
			map: google_map.map,
			icon: arrow
		});

		var kurzparkzoneCoords = [
			new google.maps.LatLng(48.219229,16.342913),
			new google.maps.LatLng(48.209392,16.33742),
			new google.maps.LatLng(48.203671,16.336733),
			new google.maps.LatLng(48.196577,16.339479),
			new google.maps.LatLng(48.186507,16.335703),
			new google.maps.LatLng(48.186965,16.343599),
			new google.maps.LatLng(48.180326,16.349436),
			new google.maps.LatLng(48.180555,16.356302),
			new google.maps.LatLng(48.188109,16.380335),
			new google.maps.LatLng(48.187651,16.393038),
			new google.maps.LatLng(48.182845,16.397844),
			new google.maps.LatLng(48.180555,16.400934),
			new google.maps.LatLng(48.192687,16.415697),
			new google.maps.LatLng(48.201383,16.405741),
			new google.maps.LatLng(48.203214,16.398874),
			new google.maps.LatLng(48.212595,16.392351),
			new google.maps.LatLng(48.213967,16.390635),
			new google.maps.LatLng(48.229521,16.387545),
			new google.maps.LatLng(48.241413,16.374498),
			new google.maps.LatLng(48.236382,16.361795),
			new google.maps.LatLng(48.235925,16.356646),
			new google.maps.LatLng(48.232037,16.353899),
			new google.maps.LatLng(48.230436,16.349092),
			new google.maps.LatLng(48.22449,16.349779),
			new google.maps.LatLng(48.219229,16.342913)
		];
		
		var kurzparkzone = new google.maps.Polygon({
			paths: kurzparkzoneCoords,
			strokeColor: "#FF0000",
			strokeOpacity: 0.8,
			strokeWeight: 2,
			fillColor: "#FF0000",
			fillOpacity: 0.25,
			map: google_map.map
		});
		
		var parkgarageMarker = new google.maps.Marker({ 
			position: new google.maps.LatLng(48.1984500,16.3680958592),
			title: 'Parkgarage 1',
			map: google_map.map,
			icon: parkgarage,
			clickable: true
		});
		
		function removeOtherIWs() {
			if (activeIW != null)
				activeIW.close();
		}
		
		google.maps.event.addListener(infowindow, 'closeclick', function(){
			activeIW = null;
		});
		
		google.maps.event.addListener(parkgarageMarker, 'click', function(){
			removeOtherIWs();
			infowindow.open(google_map.map, parkgarageMarker);
			activeIW = infowindow;
		});
		
		google.maps.event.addListener(kurzparkzone, 'click', function(event){
			removeOtherIWs();
			iwKurzparkzone.setPosition(event.latLng);
			iwKurzparkzone.open(google_map.map);
			activeIW = iwKurzparkzone;
		});
	}
});