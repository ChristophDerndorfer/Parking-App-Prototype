Ext.setup({
	tabletStartupScreen: 'tablet_startup.png',
	phoneStartupScreen: 'phone_startup.png',
	icon: 'icon.png',
	glossOnIcon: false,
	onReady: function() {

		// The following is accomplished with the Google Map API
		var position = new google.maps.LatLng(48.2000950,16.3684658592);
		var position = new google.maps.LatLng(48.18927,16.365391);
		var follow_location = false;
		var viewport;
		var activeIW = null;
		var activeMarker = null;
		var popup;
		var parkingspacemarker = null;
		var view = null;
		
		iwParkhaus1_content = '<p><b>Parkhaus 1</b><img src="disabled_parking.png" width="20" align="right"/><br /><b>&Ouml;ffnungszeiten:</b><img src="navi.png" width="40" align="right"/><br />Mo - So, 06:00 - 24:00<br /><b>Preis:</b> &#8364;2,3 / h<br /><b>Maximalh&ouml;he:</b> 2,3m<br /></p>';
		iwKurzparkzone_content = '<p><b>Kurzparkzonen</b><br />Mo - Fr, 8:00 - 22:00 Uhr<br />Sa, 07:00 - 20:00<br />So, Feiertags frei<br /></p>';
		iwFreeparking_content = '<p><b>keine Kurzparkzone</b><br /><br /><img src="navi.png" width="40" align="right"/></p>';
		iwParkhaus2_content = '<p><b>Parkhaus 2</b><img src="disabled_parking.png" width="20" align="right"/><br /><b>&Ouml;ffnungszeiten:</b><img src="navi.png" width="40" align="right"/><br />Mo - So, 06:00 - 24:00<br /><b>Preis:</b> &#8364;2,3 / h<br /><b>Maximalh&ouml;he:</b> 2,3m<br /></p>';
		
		//needed for layer panel
		Ext.regModel('Layers', {
			fields: ['Layer']});
		
		layerStore = new Ext.data.Store({
		
			model: 'Layers',
			sorters: 'Layer',
			getGroupString : function(record) {
				return record.get('Layer') [0];
			},
			data: [
			       {Layer: 'Parkgaragen'},
			       {Layer: 'Ticketautomaten'},
			       {Layer: 'Tankstellen'},
			       {Layer: 'Polizeistationen'}		   
			]
		});
		
		//needed for search results
		Ext.regModel('Search Results', {
			fields: ['Result', 'lat', 'lng']});
		
		searchResultStore = new Ext.data.Store({
		
			model: 'Search Results',
			sorters: 'Result',
			getGroupString : function(record) {
				return record.get('Result') [0];
			},
			data: [
			       {Result: 'Ergebnis #1', lat: 48.208927, lng: 16.373391},
			       {Result: 'Ergebnis #2', lat: 48.20577, lng: 16.376391},
			       {Result: 'Ergebnis #3', lat: 48.21427, lng: 16.378391},
			       {Result: 'Ergebnis #4', lat: 48.21127, lng: 16.361391},
			       {Result: 'Ergebnis #5', lat: 48.20127, lng: 16.351391},
			       {Result: 'Ergebnis #6', lat: 48.21927, lng: 16.381391},
			       {Result: 'Ergebnis #7', lat: 48.21127, lng: 16.391391}
			]
		});
		
		//needed for parking garage results
		Ext.regModel('Parking Garage Search Results', {
			fields: ['Result', 'lat', 'lng', 'dist']});
		
		pgSearchResultStore = new Ext.data.Store({
		
			model: 'Parking Garage Search Results',
			sorters: 'Result',
			getGroupString : function(record) {
				return record.get('Result') [0];
			},
			data: [
			       {Result: 'Parkhaus #1', lat: 48.1984500, lng: 16.3680958592, dist: 1.1},
			       {Result: 'Parkhaus #2', lat: 48.2084500, lng: 16.3780958592, dist: 3}
			]
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

		var searchfield = new Ext.form.Search({
			xtype: 'searchfield',
			placeHolder: 'Search',
			name: 'searchfield',
			width: 120
		});
		
		searchResultList = new Ext.List({
			xtype: 'list',
//			ui: 'black',
			scroll: 'vertical',
			store: searchResultStore,
			width: 280,
			singleSelect: false,
			multiSelect: false,
			simpleSelect: true,
			onItemDisclosure: function(record, btn, index) {
				Ext.Msg.alert('Navigation', 'Wollen Sie in die Navigation wechseln?', Ext.emptyFn);
			},
			itemTpl: '<div class="Search Results"><strong>{Result}</strong></div>'
		});
		
		searchResultList.on('itemtap', function(dataView, index, element, event) {
			removeOtherMarkers();
			removeOtherIWs();
			popup.hide();
			event.stopPropagation();
			var bounds = new google.maps.LatLngBounds(new google.maps.LatLng(searchResultStore.getAt(index).get('lat'), searchResultStore.getAt(index).get('lng')), new google.maps.LatLng(searchResultStore.getAt(index).get('lat'), searchResultStore.getAt(index).get('lng')));
			if (position.lat() != null && position.lat() != 0)
				bounds.extend(new google.maps.LatLng(position.lat(), position.lng()));
			google_map.map.fitBounds(bounds);
			google_map.map.setZoom(google_map.map.getZoom() - 1);
			var searchresultmarker = new google.maps.Marker({ 
				position: new google.maps.LatLng(searchResultStore.getAt(index).get('lat'), searchResultStore.getAt(index).get('lng')),
				map: google_map.map,
				icon: point,
				shadow: shadow,
				clickable: false
			});
			searchResultList.deselect(searchResultList.getSelectedNodes());
			
			activeMarker = searchresultmarker;
		});
		
		searchfield.on('action', function() {
			popup = new Ext.Panel({
					floating: true,
					modal: true,
					centered: true,
					height: 350,
					scroll: 'vertical',
//					ui: 'dark',
					items : searchResultList,
					dockedItems: [{
						dock: 'top',
						xtype: 'toolbar',
						title: 'Suchergebnisse'
					}]
				});
			
			popup.show('pop');
		});
		

		
		pgSearchResultList = new Ext.List({
			xtype: 'list',
//			ui: 'black',
			scroll: 'vertical',
			store: pgSearchResultStore,
			width: 280,
			singleSelect: false,
			multiSelect: false,
			simpleSelect: true,
			onItemDisclosure: function(record, btn, index) {
				Ext.Msg.alert('Navigation', 'Wollen Sie in die Navigation wechseln?', Ext.emptyFn);
			},
			itemTpl: '<div class="Search Results"><strong>{Result} ({dist} km)</strong></div>'
		});
		
		pgSearchResultList.on('itemtap', function(dataView, index, element, event) {
			removeOtherMarkers();
			removeOtherIWs();
			popup.hide();
			event.stopPropagation();
			var bounds = new google.maps.LatLngBounds(new google.maps.LatLng(pgSearchResultStore.getAt(index).get('lat'), pgSearchResultStore.getAt(index).get('lng')), new google.maps.LatLng(pgSearchResultStore.getAt(index).get('lat'), pgSearchResultStore.getAt(index).get('lng')));
			if (position.lat() != null && position.lat() != 0)
				bounds.extend(new google.maps.LatLng(position.lat(), position.lng()));
			google_map.map.fitBounds(bounds);
			google_map.map.setZoom(google_map.map.getZoom() - 1);
			var pgSearchresultmarker = new google.maps.Marker({ 
				position: new google.maps.LatLng(pgSearchResultStore.getAt(index).get('lat'), pgSearchResultStore.getAt(index).get('lng')),
				map: google_map.map,
				icon: point,
				shadow: shadow,
				clickable: false
			});
			pgSearchResultList.deselect(pgSearchResultList.getSelectedNodes());
			
			activeMarker = pgSearchresultmarker;
			if (index == 0)
			{
				var iwParkhaus1 = new InfoBox({content: iwParkhaus1_content, latlng: pgSearchresultmarker.getPosition(), map: google_map.map});
				activeIW = iwParkhaus1;
				
				google.maps.event.addListener(pgSearchresultmarker, 'click', function(){
					removeOtherIWs();
					var iwParkhaus1 = new InfoBox({content: iwParkhaus1_content, latlng: pgSearchresultmarker.getPosition(), map: google_map.map});
					activeIW = iwParkhaus1;
				});
			}
			else
			{
				var iwParkhaus2 = new InfoBox({content: iwParkhaus2_content, latlng: pgSearchresultmarker.getPosition(), map: google_map.map});
				activeIW = iwParkhaus1;
				
				google.maps.event.addListener(pgSearchresultmarker, 'click', function(){
					removeOtherIWs();
					var iwParkhaus2 = new InfoBox({content: iwParkhaus2_content, latlng: pgSearchresultmarker.getPosition(), map: google_map.map});
					activeIW = iwParkhaus2;
				});
			}
		});

		toolbar = new Ext.Toolbar({
				dock: 'top',
				xtype: 'toolbar',
//				ui : 'light',
				defaults: {
					iconMask: false
				},
				items: [
					searchfield
					,{
						xtype: 'spacer'
					},{
						icon: 'locationbutton.png',
						title: 'Gehe zu meiner Position',
						ui: 'plain',
						useIndicators: false,
//						width: 50,
//						padding: 5,
						handler : function(){
							removeOtherMarkers();
							removeOtherIWs();
							popup.hide();
							//disable tracking
							//trackingButton.ownerCt.setActive(trackingButton, false);
							if (position.lat() != null && position.lat() != 0)
							{
								google_map.map.panTo(new google.maps.LatLng(position.lat(), position.lng()));
								google_map.map.setZoom(18);
								popup.hide();
							}
						}
					}, {
						icon: 'parkbutton.png',
//						iconMask: true,	
						ui: 'plain',
						useIndicators: false,
						title: 'Nächste...',

//						width: 50,
//						padding: 5,
						handler: function() {
							
								popup = new Ext.Panel({
									floating: true,
									modal: true,
									centered: false,
									x: 5,
									y: 50,
									width: 300,
									height: 150,
//								    ui: 'dark',
									scroll: 'vertical',
									items : [
								                new Ext.Button({
//								                    ui  : 'android',
								                    text: 'gratis Parken',
								                    icon: 'freeparking_button.png',
								                    margin: '10',
								                    handler: function(button, event) {
														removeOtherMarkers();
														removeOtherIWs();
														popup.hide();
														var bounds = new google.maps.LatLngBounds(new google.maps.LatLng(48.184458, 16.374768), new google.maps.LatLng(48.184458, 16.374768));
														if (position.lat() != null && position.lat() != 0)
															bounds.extend(new google.maps.LatLng(position.lat(), position.lng()));
														
														google_map.map.fitBounds(bounds);
															
														parkingspacemarker = new google.maps.Marker({ 
															position: new google.maps.LatLng(48.184458, 16.374768),
															title: 'Parkplatz 1',
															map: google_map.map,
															icon: point,
															shadow: shadow,
															clickable: true
														});
														
														activeMarker = parkingspacemarker;
														
														var iwFreeparking = new InfoBox({content: iwFreeparking_content, latlng: parkingspacemarker.getPosition(), map: google_map.map});
														activeIW = iwFreeparking;
														
														google.maps.event.addListener(parkingspacemarker, 'click', function(){
															removeOtherIWs();
															var iwFreeparking = new InfoBox({content: iwFreeparking_content, latlng: parkingspacemarker.getPosition(), map: google_map.map});
															activeIW = iwFreeparking;
														});
														event.stopPropagation();
								                	}
								                }),
								                new Ext.Button({
//								                    ui  : 'android',
								                    text: 'nahe Parkgaragen',
								                    icon: 'garage_button.png',
								                    margin: '10',
								                    handler: function(button, event) {
								                    	popup.hide();
														popup = new Ext.Panel({
																floating: true,
																modal: true,
																centered: true,
																height: 350,
																scroll: 'vertical',
//																ui: 'dark',
																items : pgSearchResultList,
																dockedItems: [{
																	dock: 'top',
																	xtype: 'toolbar',
																	title: 'nahe Parkgaragen'
																}]
															});
														
														popup.show('pop');
														event.stopPropagation();
								                	}
								                })]
								}
								);
							
							popup.show('pop');
						}
					},{
						icon: 'layer.png',
						ui: 'plain',
						useIndicators: false,
						handler: function() {	
							if (popup)
					 		    popup.hide();
							popup = new Ext.Panel({
								floating: true,
								modal: true,
								centered: true,
								width: 200,							
								items: [
								{
									xtype: 'checkboxfield',
									name: 'freeparking',
									label: 'Gratiszonen',
									checked: 'true'
								},
								{
									xtype: 'checkboxfield',
									name: 'parkhouses',
									label: 'Parkgaragen',
									checked: 'true'
								},{
									xtype: 'checkboxfield',
									name: 'parkingmachines',
									label: 'Parkautomaten'
								},
								],
								dockedItems: [{
									dock: 'top',
									xtype: 'toolbar',
									title: 'Layers'
								}]
							});		
						  popup.show('pop');
					  }
					}
//					{
//						icon: 'infobutton.png',
//						title: 'Nearest...',
//					    ui: 'plain',
//					    useIndicators: false,
//						width: 50,
//						padding: 5,
//						handler: function(event) {
//				
//								popup = new Ext.Panel({
//									floating: true,
//									modal: true,
//									centered: true,
//									width: 300,
//									height: 350,
//									styleHtmlContent: true,
//									scroll: 'vertical',
//									html: '<p><b>Kurzparkzonen</b><br /><b>Preis:</b><br />0.5h - &#8364;0.60<br />1h - &#8364;1.20<br />1.5h - &#8364;1.80<br /><b>Zeiten:</b><br />Montag-Freitag, 8:00 - 22:00 Uhr<br />Samstags, Sonntags und Feiertags frei<br /><b>Verkaufsstellen:</b><br /></p>',
//									dockedItems: [{
//										dock: 'top',
//										xtype: 'toolbar',
//										title: 'Wien'
//									}]
//								});
//							
//							popup.show('pop');
//							event.stopPropagation();
//						}
//					}
				]
			});
		
		hardwareButtons = new Ext.Toolbar({
			dock: 'bottom',
			xtype: 'toolbar',
//			ui : 'light',
			defaults: {
				iconMask: false
			},
			items: [
				{
					icon: 'back1.png',
					width: 50,
					padding: 5,
					handler : function(){
					//disable tracking
					//trackingButton.ownerCt.setActive(trackingButton, false);
					if (position.lat() != null && position.lat() != 0)
					{
						google_map.map.panTo(new google.maps.LatLng(position.lat(), position.lng()));
						google_map.map.setZoom(18);
						popup.hide();
					}
				}
				},
				{
					xtype: 'spacer'
				},
				{
					icon: 'system1.png',
					width: 50,
					padding: 5,
					handler : function(){
						if (!this.actions){
							this.actions = new Ext.ActionSheet ({
								items: 
								[
								 	{
								 		text: 'Layer Settings',
								 		scope: this,
										handler: function() {	
								 		    this.actions.hide();
											popup = new Ext.Panel({
//												ui: 'dark',
												floating: true,
												//modal: true,
												centered: true,
												width: 200,
												//height: 350,
												//styleHtmlContent: true,
												
												items: [{
													xtype: 'checkboxfield',
													name: 'parkhouses',
													label: 'Parkgaragen'
												},{
													xtype: 'checkboxfield',
													name: 'parkingmachines',
													label: 'Parkautomaten'
												},{
													xtype: 'checkboxfield',
													name: 'freeparking',
													label: 'Gratiszonen'
												},
												],
												dockedItems: [{
													dock: 'top',
													xtype: 'toolbar',
													title: 'Layers'
												}]
											});
										
										popup.show('pop');
									}
								 	},
								 	{
								 		text: 'About Us',
								 		scope: this,
										handler: function() {
								 			this.actions.hide();
											popup = new Ext.Panel({
												floating: true,
												modal: true,
												centered: true,
												width: 300,
												height: 350,
												styleHtmlContent: true,
												scroll: 'vertical',
												html: '<p><b>CNM Studios</b><br />Christoph (Producer)<br />Michael (Designer)<br />Nem (Developer)<br /></p>',
												dockedItems: [{
													dock: 'top',
													xtype: 'toolbar',
													title: 'About Us'
												}]
											});
										
										popup.show('pop');
									}
								 	},
								 	{
								 		text: 'Cancel',
								 		scope: this,
								 		handler: function(){
								 			this.actions.hide();
								 		}
								 	},
								]
							});
						}
						this.actions.show();
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
		
		green_bar = new Ext.Toolbar({
			dock: 'top',
			xtype: 'toolbar',
			cls: 'green_bar',
			title: 'Heute: 7 bis 20 Uhr, Tickets beim Automaten'
		});

		
		view = new Ext.Panel({
			fullscreen: true,
			dockedItems: [toolbar, green_bar],
			items: [google_map],
			layout: 'fit'
		});
		
		viewport = view;
		
		
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
		
		var parkgarageMarker2 = new google.maps.Marker({ 
			position: new google.maps.LatLng(48.2084500,16.3780958592),
			title: 'Parkgarage 2',
			map: google_map.map,
			icon: parkgarage,
			clickable: true
		});
		
		
		function removeOtherIWs() {
			if (activeIW != null)
				activeIW.close();
		}
		
		function removeOtherMarkers() {
			if (activeMarker != null)
				activeMarker.setVisible(false);
		}
		
		google.maps.event.addListener(parkgarageMarker, 'click', function(){
			removeOtherIWs();
			var iwParkhaus1 = new InfoBox({content: iwParkhaus1_content, latlng: parkgarageMarker.getPosition(), map: google_map.map});
			activeIW = iwParkhaus1;
		});
		
		google.maps.event.addListener(parkgarageMarker2, 'click', function(){
			removeOtherIWs();
			var iwParkhaus2 = new InfoBox({content: iwParkhaus2_content, latlng: parkgarageMarker2.getPosition(), map: google_map.map});
			activeIW = iwParkhaus2;
		});
		
		google.maps.event.addListener(kurzparkzone, 'click', function(event){
			removeOtherIWs();
			
			var iwKurzparkzone = new InfoBox({content: iwKurzparkzone_content, latlng: event.latLng, map: google_map.map});
			
			activeIW = iwKurzparkzone;
		});
		
	}
});

function InfoBox(opts) {
  google.maps.OverlayView.call(this);
  this.latlng_ = opts.latlng;
  this.map_ = opts.map;
  this.content_ = opts.content;
  this.offsetVertical_ = -107;
  this.offsetHorizontal_ = 7;
  this.height_ = 100;
  this.width_ = 180;
 
  var me = this;
  this.boundsChangedListener_ =
    google.maps.event.addListener(this.map_, "bounds_changed", function() {
      //return me.panMap.apply(me);
    });
 
  // Once the properties of this OverlayView are initialized, set its map so
  // that we can display it.  This will trigger calls to panes_changed and
  // draw.
  this.setMap(this.map_);
}
 
/* InfoBox extends GOverlay class from the Google Maps API
 */
InfoBox.prototype = new google.maps.OverlayView();
 
/* Creates the DIV representing this InfoBox
 */
InfoBox.prototype.remove = function() {
  if (this.div_) {
    this.div_.parentNode.removeChild(this.div_);
    this.div_ = null;
  }
};
 
/* Redraw the Bar based on the current projection and zoom level
 */
InfoBox.prototype.draw = function() {
  // Creates the element if it doesn't exist already.
  this.createElement();
  if (!this.div_) return;
 
  // Calculate the DIV coordinates of two opposite corners of our bounds to
  // get the size and position of our Bar
  var pixPosition = this.getProjection().fromLatLngToDivPixel(this.latlng_);
  if (!pixPosition) return;
 
  // Now position our DIV based on the DIV coordinates of our bounds
  this.div_.style.width = this.width_ + "px";
  this.div_.style.left = (pixPosition.x + this.offsetHorizontal_) + "px";
  this.div_.style.height = this.height_ + "px";
  this.div_.style.top = (pixPosition.y + this.offsetVertical_) + "px";
  this.div_.style.display = 'block';
};

InfoBox.prototype.close = function() {
	this.setMap(null);
}

/* Creates the DIV representing this InfoBox in the floatPane.  If the panes
 * object, retrieved by calling getPanes, is null, remove the element from the
 * DOM.  If the div exists, but its parent is not the floatPane, move the div
 * to the new pane.
 * Called from within draw.  Alternatively, this can be called specifically on
 * a panes_changed event.
 */
InfoBox.prototype.createElement = function() {
  var panes = this.getPanes();
  var div = this.div_;
  if (!div) {
    // This does not handle changing panes.  You can set the map to be null and
    // then reset the map to move the div.
    div = this.div_ = document.createElement("div");
    div.className = 'infowindow_holder';
    div.style.width = this.width_ + "px";
    div.style.height = this.height_ + "px";
    
    var contentDiv = document.createElement("div");
   	contentDiv.className = 'infowindow_content';
    contentDiv.innerHTML = this.content_;
 
    var closeImg = document.createElement("img");
    closeImg.style.width = "32px";
    closeImg.style.height = "32px";
    closeImg.style.cursor = "pointer";
    closeImg.style.float = "right";
    closeImg.src = "close.gif";
    div.appendChild(closeImg);
 
    var arrowImg = document.createElement("img");
    arrowImg.className = 'infowindow_arrow';
    arrowImg.src = "iw_arrow.png";
 
    function removeInfoBox(ib) {
      return function() {
        ib.setMap(null);
      };
    }
 
    google.maps.event.addDomListener(closeImg, 'click', removeInfoBox(this));
 
    div.appendChild(contentDiv);
    div.appendChild(arrowImg);
    div.style.display = 'none';
    panes.floatPane.appendChild(div);
    //this.panMap();
  } else if (div.parentNode != panes.floatPane) {
    // The panes have changed.  Move the div.
    div.parentNode.removeChild(div);
    panes.floatPane.appendChild(div);
  } else {
    // The panes have not changed, so no need to create or move the div.
  }
}
