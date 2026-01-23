
document.getElementById('toggle-mission').addEventListener('click', function () {

    const missionSection = document.getElementById('our-mission');

    if (missionSection.style.display === 'none' || !missionSection.style.display) {

        missionSection.style.display = 'block';

        this.textContent = 'Hide Mission';

    } else {

        missionSection.style.display = 'none';

        this.textContent = 'Show Mission';

    }

});