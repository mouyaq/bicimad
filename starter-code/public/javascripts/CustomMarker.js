function CustomMarker(options) {
    this.latlng = options.position;
    this.map_ = options.map;
    this.zoomOld = this.map_.zoom;
    this.station = options.station;
    this.xmlHttpStatus = options.xmlHttpStatus;
	//this.args = args;	
    //this.setMap(options.map);	
    
    this.setValues( options );
    
    this.inner_ = $('<div>').css({
        position: 'relative',
        left: '-50%', top: '-50%',
        width: options.width,
        height: options.height,
        cursor: 'default'
    });

    this.div_ = $('<div>')
        .append( this.inner_ )
        .css({
            position: 'absolute',
            display: 'none'
        });
}

CustomMarker.prototype = new google.maps.OverlayView();

CustomMarker.prototype.draw = function() {
    var zoomFactor = this.map_.zoom
    var size = this.map_.zoom * 5;
    var sizepx = size+"px";

    var projection = this.getProjection();
    var position = projection.fromLatLngToDivPixel( this.get('position') );

    this.div_.css({
        left: position.x,
        top: position.y,
        opacity: 1,
        display: 'block'
    })

    this.inner_.css({
        // background: 'yellow',
        width: this.resizeChart(),
        height: this.resizeChart()
    });

    if (this.chart && this.zoomNotChanged()) {
        return;
    }

    var that = this;
    this.chart = new google.visualization.PieChart( this.inner_[0] );
    this.chart.draw( this.get('chartData'), this.get('chartOptions') );
    if(this.xmlHttpStatus === 403) {
        this.chart.setAction({
            id: '1',
            text: 'Login',
            action: function() {
                window.location.replace('/login');
            }
        });
    }
    else {
        this.chart.setAction({
            id: '1',
            text: 'Show info',
            action: function() {      
                $("#dialog").attr('title', 'Station info');
                $("#dialog").dialog({
                    autoOpen: false,
                    show: {
                        effect: "blind",
                        duration: 500
                    },
                    hide: {
                        effect: "explode",
                        duration: 500
                    }
                });
                // var stationInfoHtml = `
                //     <p>Station name: <b>${that.station.name}</b></p>
                //     <p>Free bikes: <b>${that.station.dock_bikes}</b></p>
                //     <p>Free docks: <b>${that.station.free_bases}</b></p>
                //     <p>Bikes reserved: <b>${that.station.reservations_count}</b></p>
                // `
                var stationInfoHtml = `
                <table>
                    <tr>
                        <th align="left">Station name</td>
                        <td align="right">${that.station.name}</td>
                    </tr>
                    <tr>
                        <th align="left">Free bikes</td>
                        <td align="right">${that.station.dock_bikes}</td>
                    </tr>
                    <tr>
                        <th align="left">Free docks</td>
                        <td align="right">${that.station.free_bases}</td>
                    </tr>
                    <tr>
                        <th align="left">Bikes reserved</td>
                        <td align="right">${that.station.reservations_count}</td>
                    </tr>
                </table>
            `
                $("#dialog-text").html("");
                $("#dialog-text").append(stationInfoHtml);
                $("#dialog").dialog("open");
                
            }
        });
        this.chart.setAction({
            id: '2',
            text: 'Create issue',
            action: function() {
                var stationId = that.station.id;
                var stationIssueUrl = `/issue/new/station?id=${stationId}`;
                window.location.replace(stationIssueUrl);
            }
        });
        this.chart.setAction({
            id: '3',
            text: 'Search issue',
            action: function() {

                var stationId = that.station.id;
                var url = '/issue/search';
      
                // $(document).ready(function(){
                //     $('<form action="/issue/search"></form>').appendTo('body').submit();
                // });

                var form = $(document.createElement('form'));
                $(form).attr("action", url);
                $(form).attr("method", "POST");

                var input = $("<input>")
                    .attr("type", "hidden")
                    .attr("name", "referenceIdStation")
                    .val(stationId);


                $(form).append($(input));
                form.appendTo( document.body )
                $(form).submit();

            }
        }); 
    }
 
};

CustomMarker.prototype.remove = function() {
	if (this.div) {
		this.div.parentNode.removeChild(this.div);
		this.div = null;
	}	
};

CustomMarker.prototype.getPosition = function() {
	return this.latlng;	
};

CustomMarker.prototype.setVisible = function(visible) {

}

CustomMarker.prototype.onAdd = function() {    
    $( this.getPanes().overlayMouseTarget ).append( this.div_ );
};

CustomMarker.prototype.onRemove = function() {
    this.div_.remove();
};

CustomMarker.prototype.resizeChart = function() {
    // base = 40px
    var base = 40;
    // increments by 20px
    var increment = 20;
    var zoomArray = [14,15,16,17,18,19,20,21,22];

    var index = zoomArray.indexOf(this.map_.zoom);
    var resizeValue = base + (index * increment);
    return `${resizeValue}px`

};

CustomMarker.prototype.zoomNotChanged= function() {
    if (this.zoomOld === this.map_.zoom) {
        return true
    }
    else {
        this.zoomOld = this.map_.zoom;
        return false;
    }
};

// // Set the visibility to 'hidden' or 'visible'.
// CustomMarker.prototype.hide = function() {
//     if (this.div_) {
//     // The visibility property must be a string enclosed in quotes.
//     this.div_.style.visibility = 'hidden';
//     }
// };

// CustomMarker.prototype.show = function() {
//     if (this.div_) {
//     this.div_.style.visibility = 'visible';
//     }
// };

// CustomMarker.prototype.toggle = function() {
//     if (this.div_) {
//     if (this.div_.style.visibility === 'hidden') {
//         this.show();
//     } else {
//         this.hide();
//     }
//     }
// };

// CustomMarker.prototype.printMsg = function() {

// }

// CustomMarker.prototype.addClickEvent = function() { 
//     google.maps.event.addDomListener($(this.div_), 'click', function() { 
//         alert("you clicked!"); 
//     }); 
// } 