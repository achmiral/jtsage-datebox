/* JTSage-DateBox 
 *
 * MODE File
 *
 * Provide the following display modes:
 * * datebox
 * * timebox
 * * durationbox
 *
 * Define the standard options as well
 */

mergeOpts({		
	validHours: false,
	repButton: true,
	durationStep: 1,
	durationSteppers: {"d": 1, "h": 1, "i": 1, "s": 1}
});

JTSageDateBox._dbox_run = function() {
	var w = this,
		g = this.drag,
		timer = parseInt(6.09 + ( 142.8 * Math.pow(Math.E, -0.039 * g.cnt)), 10);
	
	g.didRun = true;
	g.cnt++;
	
	w._offset( g.target[0], g.target[1], false );
	w._dbox_run_update();
	w.runButton = setTimeout(function() {w._dbox_run();}, timer);
};

JTSageDateBox._dbox_run_update = function(shortRun) {
	// Update the current view of the datebox.
	//
	// Datebox is different from most modes, it replaints
	// it's screen, it doesn't rebuild & replace it.
	var w = this,
		o = this.options,
		i = w.theDate.getTime() - w.initDate.getTime(),
		dur = ( o.mode === "durationbox" ? true : false ),
		cDur = w._dur( i<0 ? 0 : i );

	if ( i < 0 ) {
		w.lastDuration = 0;
		if ( dur ) { w.theDate.setTime( w.initDate.getTime() ); }
	}
	
	if ( dur ) {
		w.lastDuration = i / 1000;
		if ( o.minDur !== false &&
				( w.theDate.getEpoch() - w.initDate.getEpoch() ) < o.minDur ) {
			w.theDate = new Date( w.initDate.getTime() + ( o.minDur * 1000 ) );
			w.lastDuration = o.minDur;
			cDur = w._dur( o.minDur * 1000 );
		}
		if ( o.maxDur !== false &&
				( w.theDate.getEpoch() - w.initDate.getEpoch() ) > o.maxDur ) {
			w.theDate = new Date( w.initDate.getTime() + ( o.maxDur * 1000 ) );
			w.lastDuration = o.maxDur;
			cDur = w._dur( o.maxDur * 1000 );
		}
	}
		
	if ( shortRun !== true && dur !== true ) {
		w._check();
	
		if ( o.mode === "datebox" ) {
			w.d.intHTML
				.find( ".ui-datebox-header" )
					.find( "h4" )
						.text( w._formatter( w.__( "headerFormat" ), w.theDate ) );
		}
		
		if ( o.useSetButton ) {
			if ( w.dateOK === false ) { 
				w.setBut.addClass( o.disabledState );
			} else {
				w.setBut.removeClass( o.disabledState );
			}
		}
	}
	
	w.d.divIn.find( "input" ).each(function () {
		switch ( $(this).data( "field" ) ) {
			case "y":
				$(this).val(w.theDate.get(0)); break;
			case "m":
				$(this).val(w.theDate.get(1) + 1); break;
			case "d":
				$(this).val( ( dur ? cDur[0] : w.theDate.get(2) ) );
				break;
			case "h":
				if ( dur ) {
					$(this).val(cDur[1]);
				} else {
					if ( w.__("timeFormat") === 12 ) {
						$(this).val(w.theDate.get12hr());
					} else {
						$(this).val(w.theDate.get(3)); 
					}
				}
				break;
			case "i":
				if ( dur ) {
					$(this).val(cDur[2]);
				} else {
					$(this).val(w._zPad(w.theDate.get(4)));
				} 
				break;
			case "M":
				$(this).val(w.__("monthsOfYearShort")[w.theDate.get(1)]); break;
			case "a":
				$(this).val(w.__( "meridiem" )[ (w.theDate.get(3) > 11) ? 1 : 0 ] );
				break;
			case "s":
				if ( dur ) {
					$(this).val(cDur[3]);
				} else {
					//console.log(w.theDate);
					$(this).val(w._zPad(w.theDate.get(5)));
				} 
				break;
		}
	});
	if ( w.__( "useArabicIndic" ) === true ) { w._doIndic(); }
};

JTSageDateBox._dbox_vhour = function (delta) {
	// Check to see if the datebox hour is valid.
	var w = this,
		o = this.options, tmp, 
		closeya = [25,0],
		closenay = [25,0];
		
	if ( o.validHours === false ) { return true; }
	if ( $.inArray(w.theDate.getHours(), o.validHours) > -1 ) { return true; }
	
	tmp = w.theDate.getHours();
	$.each(o.validHours, function(){
		if ( ((tmp < this)?1:-1) === delta ) {
			if ( closeya[0] > Math.abs(this-tmp) ) {
				closeya = [Math.abs(this-tmp),parseInt(this,10)];
			}
		} else {
			if ( closenay[0] > Math.abs(this-tmp) ) {
				closenay = [Math.abs(this-tmp),parseInt(this,10)];
			}
		}
	});
	if ( closeya[1] !== 0 ) { w.theDate.setHours(closeya[1]); }
	else { w.theDate.setHours(closenay[1]); }
};

JTSageDateBox._dbox_enter = function (item) {
	var tmp,
		w = this, 
		t = 0;
	
	if ( item.data( "field" ) === "M" ) {
		tmp = $.inArray( item.val(), w.__( "monthsOfYearShort" ) );
		if ( tmp > -1 ) { w.theDate.setMonth( tmp ); }
	}
	if ( item.val() !== "" && item.val().toString().search(/^[0-9]+$/) === 0 ) {
		switch ( item.data( "field" ) ) {
			case "y":
				w.theDate.setD( 0, parseInt(item.val(),10)); break;
			case "m":
				w.theDate.setD( 1, parseInt(item.val(),10)-1); break;
			case "d":
				w.theDate.setD( 2, parseInt(item.val(),10));
				t += (60*60*24) * parseInt(item.val(),10);
				break;
			case "h":
				w.theDate.setD( 3, parseInt(item.val(),10));
				t += (60*60) * parseInt(item.val(),10);
				break;
			case "i":
				w.theDate.setD( 4, parseInt(item.val(),10));
				t += (60) * parseInt(item.val(),10);
				break;
			case "s":
				w.theDate.setD( 5, parseInt(item.val(),10));
				t += parseInt(item.val(),10); 
				break;
		}
	}
	if ( this.options.mode === "durationbox" ) { 
		w.theDate.setTime( w.initDate.getTime() + ( t * 1000 ) );
	}
	setTimeout(function() { w.refresh(); }, 150);
};

JTSageDateBox._dbox_button = function (direction, field, amount) {
	var w = this,
		o = this.options;
	
	return $("<div>")
		.addClass( "ui-datebox-datebox-button" )
		.addClass( o.btnCls + o.themeButton )
		.addClass( function() {
			switch ( w.baseMode ) {
				case "jqm":
				case "bootstrap":
				case "bootstrap4":
					return o.icnCls + ( direction > 0 ? o.calNextMonthIcon : o.calPrevMonthIcon );
				default:
					return null;
			}
		})
		.data({
			"field": field,
			"amount": amount * direction
		})
		.append( function() {
			switch ( w.baseMode ) {
				case "jqueryui":
					return $("<span>").addClass( o.icnCls + (direction > 0 ? 
						o.calNextMonthIcon : 
						o.calPrevMonthIcon )
					);
				default:
					return null;
			}
		});
};

JTSageDateBox._build.timebox = function () { this._build.datebox.apply( this, [] ); };
JTSageDateBox._build.datetimebox = function () { this._build.datebox.apply( this, [] ); };
JTSageDateBox._build.durationbox =  function () { this._build.datebox.apply( this, [] ); };

JTSageDateBox._build.datebox = function () {
	var offAmount, i, tmp, allControls, currentControl, controlButtons,
		w = this,
		g = this.drag,
		o = this.options, 
		dur = ( o.mode === "durationbox" ? true : false ),
		cnt = 0,
		defDurOrder = ["d","h","i","s"],
		uid = "ui-datebox-";
	
	if ( typeof w.d.intHTML !== "boolean" ) {
		w.d.intHTML.empty().remove();
	}
	
	w.d.headerText = ( ( w._grabLabel() !== false ) ?
		w._grabLabel() : 
		( ( o.mode === "datebox" ) ? 
			w.__( "titleDateDialogLabel" ) :
			w.__( "titleTimeDialogLabel" )
		)
	);
	w.d.intHTML = $( "<span>" );
	
	switch ( o.mode ) {
		case "durationbox" :
			w.fldOrder = w.__( "durationOrder" );
			break;
		case "timebox" :
			w.fldOrder = w.__( "timeFieldOrder" );
			break;
		case "datetimebox" :
			w.fldOrder = w.__( "datetimeFieldOrder" );
			break;
		case "datebox" :
		default :
			w.fldOrder = w.__( "dateFieldOrder" );
			break;
	}

	if ( !dur ) {
		w._check();
		w._minStepFix();
		w._dbox_vhour( typeof w._dbox_delta !== "undefined" ? w._dbox_delta : 1 );
	} else {
		w.dateOK = true;
		w._fixstepper( w.fldOrder );
	}
	
	if ( o.mode === "datebox" || o.mode === "datetimebox" ) { 
		tmp = ( w.baseMode === "bootstrap4" ) ? "h5" : "h4";
		$( w._spf("<div class='{cls}'><" + tmp + ">{text}</" + tmp + "></div>", {
			cls: uid + "header text-center",
			text: w._formatter( w.__( "headerFormat"), w.theDate )
		})).appendTo(w.d.intHTML); 
	}
	
	allControls = $( "<div>" ).addClass( uid + "datebox-groups" );

	for(i = 0; i < w.fldOrder.length; i++) {
		currentControl = $( "<div>" ).addClass( uid + "datebox-group" );

		if ( w.baseMode === "jqm" ) {
			currentControl.addClass( "ui-block-" + ["a","b","c","d","e"][cnt]);
		}

		if ( dur ) {
			offAmount = o.durationSteppers[w.fldOrder[i]];
		} else {
			if ( w.fldOrder[i] === "i" ) { 
				offAmount = o.minuteStep; 
			} else { 
				offAmount = 1;
			}
		}

		if ( w.fldOrder[i] !== "a" || w.__( "timeFormat" ) === 12 ) {
			w._dbox_button( 1, w.fldOrder[i], offAmount ).appendTo( currentControl );

			if ( dur ) {
				$( w._spf("<div><label>{text}</label></div>", {
					text: w.__( "durationLabel" )[ $.inArray( w.fldOrder[i], defDurOrder ) ]
				}))
					.addClass( uid + "datebox-label " + "ui-body-" + o.themeInput)
					.appendTo(currentControl);
			}

			$("<div><input class='form-control w-100 " + o.extraInputClass + "' type='text'></div>")
				.addClass( function() {
					switch ( w.baseMode ) {
						case "jqm":
							return "ui-input-text ui-body-" + o.themeInput + " ui-mini";
						case "bootstrap":
						case "bootstrap4":
							return o.themeInput;	
						default:
							return null;
					}
				})
				.appendTo(currentControl)
				.find( "input" )
					.data({
						"field": w.fldOrder[i],
						"amount": offAmount
					})
					.addClass( function() {
						if ( w.baseMode === "bootstrap4" && o.mode === "datetimebox" ) { 
							return "px-1";
						}
					});

			w._dbox_button( -1, w.fldOrder[i], offAmount ).appendTo( currentControl );

			currentControl.appendTo(allControls);
			cnt++;
		}
	}
	
	switch ( w.baseMode ) {
		case "jqm":
			allControls.addClass( "ui-grid-" + [0, 0, "a", "b", "c", "d", "e"][cnt] );
			break;
		case "bootstrap":
			allControls.addClass( "row" );
			allControls.find( "." + uid + "datebox-group" ).each( function() {
				$(this)
					.addClass("col-xs-" + Math.floor( 12 / cnt ) )
					.css( { "padding-left" : 0, "padding-right" : 0 } );
			});
			break;
		case "bootstrap4":
			allControls.addClass( "row" );
			allControls.find( "." + uid + "datebox-group" ).each( function() {
				$(this).addClass("px-0 col-sm-" + Math.floor( 12 / cnt ) );
			});
			break;
		case "jqueryui":
			allControls.find( "." + uid + "datebox-group" ).each( function() {
				$(this).css( "width", 100 / cnt + "%" );
			});
			break;
	}

	allControls.appendTo(w.d.intHTML);
	
	w.d.divIn = allControls	;
	w._dbox_run_update(true);
	
	if ( o.useSetButton || o.useClearButton  || o.useCancelButton ||
			o.useTodayButton || o.useTomorrowButton ) {

		controlButtons = $( "<div>", { "class": uid + "controls" } );
		
		if ( o.useSetButton ) {
			switch (o.mode) {
				case "timebox" :
					tmp = w.__("setTimeButtonLabel"); break;
				case "durationbox" :
					tmp = w.__("setDurationButtonLabel"); break;
				case "datebox":
				case "datetimebox":
				default:
					tmp = w.__("setDateButtonLabel"); break;
			}
			w.setBut = w._stdBtn.close.apply( w, [tmp] );
			w.setBut.appendTo(controlButtons);
		}
		if ( o.useTodayButton ) {
			controlButtons.append(w._stdBtn.today.apply(w));
		}
		if ( o.useTomorrowButton ) {
			controlButtons.append(w._stdBtn.tomorrow.apply(w));
		}
		if ( o.useClearButton ) {
			controlButtons.append(w._stdBtn.clear.apply(w));
		}
		if (o.useCancelButton) {
		    controlButtons.append(w._stdBtn.cancel.apply(w));
		}

		w._controlGroup( controlButtons ).appendTo( w.d.intHTML );
	}
	
	if ( ! o.repButton ) {
		w.d.intHTML.on(o.clickEvent, "."+ uid + "datebox-button", function(e) {
			allControls.find( ":focus" ).blur();
			e.preventDefault();
			w._dbox_delta = ( $( this ).data( "amount" ) > 1 ) ? 1 : -1;
			w._offset(
				$( this ).data( "field" ),
				$( this ).data( "amount" )
			);
		});
	}
	
	allControls.on( "change", "input", function() { w._dbox_enter( $( this ) ); });
	allControls.on( "keypress", "input", function(e) {
		if ( e.which === 13 && w.dateOK === true ) {
			w._dbox_enter( $( this ) );
			w._t( {
				method: "set",
				value: w._formatter(w.__fmt(),w.theDate),
				date: w.theDate
			} );
			w._t( { method: "close" } );
		}
	});
			
	if ( w.wheelExists ) { // Mousewheel operation, if plugin is loaded
		allControls.on( "mousewheel", "input", function( e, d ) {
			e.preventDefault();
			w._dbox_delta = d < 0 ? -1 : 1;
			w._offset( 
				$( this ).data( "field" ),
				( ( d < 0 ) ? -1 : 1 ) * $( this ).data( "amount" )
			);
		});
	}
	
	if ( o.repButton ) {
		w.d.intHTML.on(g.eStart, "."+ uid + "datebox-button", function(e) {
			e.preventDefault();
			allControls.find(":focus").blur();

			tmp = [ 
				$( this ).data( "field" ),
				$( this ).data( "amount" )
			];

			g.move = true;
			g.cnt = 0;
			w._dbox_delta = ( $( this ).data( "amount" ) > 1 ) ? 1 : -1;
			w._offset( tmp[0], tmp[1], false );
			w._dbox_run_update();
			if ( !w.runButton ) {
				g.target = tmp;
				w.runButton = setTimeout( function() { w._dbox_run(); }, 500 );
			}
		});
		w.d.intHTML.on(g.eEndA, "." + uid + "datebox-button", function(e) {
			if ( g.move ) {
				e.preventDefault();
				clearTimeout( w.runButton );
				w.runButton = false;
				g.move = false;
			}
		});
	}
};

