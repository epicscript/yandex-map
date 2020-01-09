ymaps.ready(init);

const INITIAL_OBJ_COUNT = 3;
const mapCenter = [51.15, 71.43];

function init() {
  const formTemplate = document.querySelector("#formTemplate").innerHTML;
  const renderForm = Handlebars.compile(formTemplate);

  const map = new ymaps.Map("map", {
    center: mapCenter, //Нур-Султан
    zoom: 11
  });

  const cluster = new ymaps.Clusterer({
    preset: "islands#invertedVioletClusterIcons",
    clusterDisableClickZoom: true,
    // openBalloonOnClick: false,
    // Устанавливаем стандартный макет балуна кластера "Карусель".
    clusterBalloonContentLayout: "cluster#balloonCarousel",
    // В данном примере балун никогда не будет открываться в режиме панели.
    clusterBalloonPanelMaxMapArea: 0,
    // Устанавливаем размеры макета контента балуна (в пикселях).
    clusterBalloonContentLayoutWidth: 400,
    clusterBalloonContentLayoutHeight: 400,
    // Устанавливаем максимальное количество элементов в нижней панели на одной странице
    clusterBalloonPagerSize: 5
  });

  for (let i = 0; i < INITIAL_OBJ_COUNT; i++) {
    const placemark = new ymaps.Placemark(
      getRandomPosition(),
      {
        balloonContentFooter: renderForm()
      },
      {
        iconLayout: "default#image",
        iconImageHref: "img/objIcon.png",
        iconImageSize: [44, 66]
      }
    );

    placemark.events.add("click", placemarkClickHandler);
    placemark.balloon.events.add("open", balloonOpenHandler);

    map.geoObjects.add(placemark);
    cluster.add(placemark);
  }

  map.geoObjects.add(cluster);

  function placemarkClickHandler(e) {
    const placemark = e.get("target");

    getAddress(placemark.geometry.getCoordinates()).then(res => {
      const headerTemplate = document.querySelector("#headerTemplate")
        .innerHTML;
      const renderHeader = Handlebars.compile(headerTemplate);

      placemark.properties.set(
        "balloonContentHeader",
        renderHeader({ address: res })
      );
    });
  }

  function balloonOpenHandler(e) {
    document.addEventListener("click", function(e) {
      if (e.target.tagName === "BUTTON") {
        const submitButton = document.getElementById("add");
        const nameInput = document.getElementById("input-name");
        const nameLocation = document.getElementById("input-location");
        const comment = document.getElementById("input-comment");

        //
        const commentsTemplate = document.querySelector("#commentsTemplate")
          .innerHTML;
        const renderComments = Handlebars.compile(commentsTemplate);

        e.preventDefault();

        geocode(`${nameLocation.value}`).then(res => {
          const placemark = new ymaps.Placemark(
            res,
            {
              balloonContentFooter: renderForm()
            },
            {
              iconLayout: "default#image",
              iconImageHref: "img/objIcon.png",
              iconImageSize: [44, 66]
            }
          );

          placemark.properties.set(
            "balloonContentBody",
            renderComments({
              name: nameInput.value,
              location: nameLocation.value,
              comment: comment.value
            })
          );

          placemark.events.add("click", placemarkClickHandler);
          placemark.balloon.events.add("open", balloonOpenHandler);

          map.geoObjects.add(placemark);
          cluster.add(placemark);
        });
      }
    });
  }

  // ! ???
  function getAddress(coords) {
    return new Promise((resolve, reject) => {
      ymaps
        .geocode(coords)
        .then(res => {
          const firstGeoObject = res.geoObjects.get(0);
          resolve(firstGeoObject.getAddressLine());
        })
        .catch(error => {
          reject(error);
        });
    });
  }

  function geocode(address) {
    return ymaps.geocode(address).then(result => {
      const points = result.geoObjects.toArray();

      if (points.length) {
        return points[0].geometry.getCoordinates();
      }
    });
  }
  // СМ
  //   const cache = new Map();

  //   function geocode(address) {
  //     if (cache.has(address)) {
  //       return cache.get(address);
  //     }

  //     cache.set(
  //       address,
  //       ymaps.geocode(address).then(result => {
  //         const points = result.geoObjects.toArray();

  //         if (points.length) {
  //           return points[0].geometry.getCoordinates();
  //         }
  //       })
  //     );

  //     return cache.get(address);
  //   }
  // }
}
function getRandomPosition() {
  return [
    mapCenter[0] + (Math.random() * 0.2 - 0.12),
    mapCenter[1] + (Math.random() * 0.3 - 0.1)
  ];

  // init END
}
